# frozen_string_literal: true

# Emits a plain-Markdown twin of every indexable page at the same URL + ".md"
# (/about → /about.md, / → /index.md, /news/foo/ → /news/foo.md).
#
# Why: AI crawlers measurably prefer these. In published server-log studies of
# sites offering both, GPTBot took the .md version of a page ~35% of the time
# and OAI-SearchBot ~23%. Markdown costs them 60-80% fewer tokens than our
# Bootstrap HTML, so we're cheaper to read — and cheaper pages get read.
#
# Discovery is by literal URL plus the rel="alternate" link in _includes/head.html.
# We deliberately do NOT implement `Accept: text/markdown` content negotiation:
# the same studies found no crawler that uses it.
#
# ── The one trick worth understanding ────────────────────────────────────────
# Jekyll picks a converter from a page's SOURCE extension, not its output path.
# Naming these pages "about.md" would hand them to the Markdown converter and
# we'd get HTML back — the exact opposite of the point. So each variant is
# created with an .html source name and steered to its .md output path with
# `permalink`. Liquid still renders; Markdown conversion never runs.
#
# The body is passed through as the `md_body` data field rather than as page
# content, so CMS-authored prose containing {{ or {% is never evaluated as
# Liquid. _layouts/md_page.html does the rest.
module TkdUniv
  class MarkdownVariants < Jekyll::Generator
    safe true
    # Run after other generators so anything they add to the site is included.
    priority :low

    LAYOUT = "md_page"

    def generate(site)
      @site = site

      sources = site.pages.select { |p| eligible_page?(p) }
      site.collections.each_value do |collection|
        next unless collection.write?

        sources.concat(collection.docs.select { |d| eligible?(d) })
      end

      sources.each { |source| site.pages << build_variant(source) }
    end

    private

    # A page earns a variant if it's a real HTML page we want crawled.
    # `noindex` is the single authoritative opt-out across the sitemap, llms.txt
    # and this plugin — see the header comment in /sitemap.xml.
    def eligible?(doc)
      return false if doc.data["noindex"] == true
      return false if doc.data["sitemap"] == false
      return false if doc.data["layout"].to_s == LAYOUT

      url = doc.url.to_s
      !url.empty? && url.start_with?("/")
    end

    def eligible_page?(page)
      return false unless page.output_ext == ".html"

      eligible?(page)
    end

    def build_variant(source)
      # .html source name => no Markdown conversion. See header comment.
      variant = Jekyll::PageWithoutAFile.new(@site, @site.source, "", "#{md_basename(source)}.html")

      variant.data = source.data.dup
      variant.data["layout"]        = LAYOUT
      variant.data["permalink"]     = md_url(source)
      variant.data["sitemap"]       = false
      variant.data["md_source_url"] = source.url
      variant.data["md_body"]       = prose_body(source)
      variant.data["md_date"]       = source.data["last_modified_at"] || source.data["date"]

      # Let head.html know a twin exists without re-deriving the URL there.
      source.data["md_variant_url"] = variant.data["permalink"]

      variant
    end

    # `content` here is the raw source — this runs before rendering, so a body
    # that is really a template arrives with its Liquid tags intact. Emitting
    # that would hand a crawler `{% for post in site.posts %}` and a pile of
    # Bootstrap classes instead of prose. Two pages on this site are like that:
    # /news (a post grid) and /summer-camp (a signup form). Neither loses
    # anything by being dropped — their actual information is in front matter,
    # and /news re-lists its posts from site.posts via `md_list_posts`.
    #
    # Bodies that are genuine prose with an HTML snippet inside them are kept,
    # with the markup taken out: the call-now button on /about, the base64
    # photo-grid carrier div in a news post. Markdown syntax is left alone —
    # only angle-bracket tags go. Blank-line runs left behind get squeezed so
    # the result reads like something a person wrote.
    def prose_body(source)
      body = source.content.to_s
      return "" if body.match?(/\{%|\{\{/)

      body
        .gsub(%r{<(script|style)\b.*?</\1>}mi, "") # drop JS/CSS bodies, not just their tags
        .gsub(/<[^>]+>/, "")
        .gsub(/[ \t]+$/, "")
        .gsub(/\n{3,}/, "\n\n")
        .strip
    end

    # "/"              => "/index.md"
    # "/about"         => "/about.md"
    # "/news/foo/"     => "/news/foo.md"
    def md_url(source)
      path = source.url.to_s.chomp("/")
      path = "/index" if path.empty?
      path = path.sub(%r{/index\.html\z}, "/index").sub(/\.html\z/, "")
      "#{path}.md"
    end

    # Jekyll needs distinct source names; derive one from the output path.
    def md_basename(source)
      md_url(source).sub(%r{\A/}, "").sub(/\.md\z/, "").gsub("/", "-")
    end
  end
end
