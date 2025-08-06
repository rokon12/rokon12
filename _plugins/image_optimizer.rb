# Note: This won't work on GitHub Pages as it doesn't allow custom plugins
# You'd need to build locally or use GitHub Actions

require 'mini_magick'

module Jekyll
  class ImageOptimizer < Generator
    safe true
    priority :low

    def generate(site)
      # This would optimize images during build
      # But GitHub Pages doesn't support custom plugins
    end
  end
end