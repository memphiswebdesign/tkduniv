# Expose selected environment variables as Jekyll site config keys so
# templates can reference them without hardcoding secret values in source.
# Values come from Netlify environment variables (or the local shell).
# Falls back to empty string so local builds don't error.
module Jekyll
  class EnvConfig < Generator
    safe true
    priority :highest

    def generate(site)
      site.config["spark_api_key"] = ENV["SPARK_API_KEY"] || ""
    end
  end
end
