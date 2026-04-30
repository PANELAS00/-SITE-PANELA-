(function() {
    console.log('🖼️ Image Patch Script Active');

    function fixUrl(url) {
        if (!url || typeof url !== 'string') return url;

        // Handle Next.js Image Optimizer URLs
        if (url.includes('/_next/image?url=')) {
            try {
                const params = new URLSearchParams(url.split('?')[1]);
                let decodedUrl = params.get('url');
                if (decodedUrl) {
                    url = decodedUrl;
                }
            } catch (e) {
                console.warn('Failed to parse Next.js image URL:', url);
            }
        }

        // Handle CDN URLs and absolute paths
        if (url.includes('cdn.wspanelas.com/images/')) {
            url = url.split('cdn.wspanelas.com/images/')[1];
            return '/images/' + url;
        }

        if (url.includes('/products/')) {
            return url.replace('/products/', '/images/');
        }

        // Fix relative paths that should be absolute in the images folder
        if (url.startsWith('images/') && !url.startsWith('/')) {
            return '/' + url;
        }

        return url;
    }

    function fixSrcSet(srcset) {
        if (!srcset || typeof srcset !== 'string') return srcset;
        return srcset.split(',').map(part => {
            const trimmed = part.trim();
            const lastSpaceIndex = trimmed.lastIndexOf(' ');
            if (lastSpaceIndex === -1) return fixUrl(trimmed);
            const url = trimmed.substring(0, lastSpaceIndex);
            const size = trimmed.substring(lastSpaceIndex);
            return fixUrl(url) + size;
        }).join(', ');
    }

    function patchElement(el) {
        if (el.tagName === 'IMG' || el.tagName === 'SOURCE') {
            if (el.src) {
                const newSrc = fixUrl(el.src);
                if (el.src !== newSrc) el.src = newSrc;
            }
            if (el.srcset) {
                const newSrcSet = fixSrcSet(el.srcset);
                if (el.srcset !== newSrcSet) el.srcset = newSrcSet;
            }
        }
        if (el.tagName === 'LINK' && (el.rel === 'preload' || el.rel === 'prefetch') && el.as === 'image') {
            if (el.href) {
                const newHref = fixUrl(el.href);
                if (el.href !== newHref) el.href = newHref;
            }
            if (el.imagesrcset) {
                const newImageSrcSet = fixSrcSet(el.imagesrcset);
                if (el.imagesrcset !== newImageSrcSet) el.imagesrcset = newImageSrcSet;
            }
        }
    }

    // Proxy the __NEXT_DATA__ object if it exists
    if (window.__NEXT_DATA__) {
        console.log('📦 Patching __NEXT_DATA__');
        const dataStr = JSON.stringify(window.__NEXT_DATA__);
        const patchedStr = dataStr.replace(/\/products\//g, '/images/');
        try {
            window.__NEXT_DATA__ = JSON.parse(patchedStr);
        } catch (e) {
            console.error('Failed to patch __NEXT_DATA__');
        }
    }

    // Observe DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    patchElement(node);
                    node.querySelectorAll('img, source, link[as="image"]').forEach(patchElement);
                }
            });
            if (mutation.type === 'attributes' && (mutation.attributeName === 'src' || mutation.attributeName === 'srcset' || mutation.attributeName === 'imagesrcset')) {
                patchElement(mutation.target);
            }
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'srcset', 'imagesrcset']
    });

    // Initial pass
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img, source, link[as="image"]').forEach(patchElement);
    });

    // Global override for Image constructor
    const OriginalImage = window.Image;
    window.Image = function() {
        const img = new OriginalImage();
        const originalSetAttribute = img.setAttribute;
        img.setAttribute = function(name, value) {
            if (name === 'src') value = fixUrl(value);
            if (name === 'srcset') value = fixSrcSet(value);
            originalSetAttribute.call(img, name, value);
        };
        Object.defineProperty(img, 'src', {
            set: function(val) {
                this.setAttribute('src', val);
            },
            get: function() {
                return this.getAttribute('src');
            }
        });
        return img;
    };

})();
