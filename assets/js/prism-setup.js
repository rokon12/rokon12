// Prism.js setup for enhanced syntax highlighting
document.addEventListener('DOMContentLoaded', function() {
    // Process all code blocks
    document.querySelectorAll('pre').forEach(function(pre) {
        // Check if pre has a code child
        let code = pre.querySelector('code');
        
        if (!code) {
            // If no code element, wrap content in code element
            code = document.createElement('code');
            code.innerHTML = pre.innerHTML;
            pre.innerHTML = '';
            pre.appendChild(code);
        }
        
        // Check if the code block already has a language class
        if (!code.className || !code.className.includes('language-')) {
            // Also check if pre has highlighter-rouge class (Jekyll default)
            if (pre.className.includes('highlighter-rouge')) {
                // Remove highlighter-rouge class
                pre.className = pre.className.replace('highlighter-rouge', '');
            }
            
            // Try to detect Java code by looking for common Java keywords
            const content = code.textContent;
            if (content.includes('public class') || content.includes('import java') || 
                content.includes('public static void') || content.includes('private ') ||
                content.includes('extends ') || content.includes('implements ')) {
                code.className = 'language-java';
                pre.className = 'language-java';
            } else if (content.includes('function') || content.includes('const ') || 
                       content.includes('let ') || content.includes('var ')) {
                code.className = 'language-javascript';
                pre.className = 'language-javascript';
            } else if (content.includes('def ') || content.includes('import ') && content.includes('from ')) {
                code.className = 'language-python';
                pre.className = 'language-python';
            } else if (content.includes('SELECT ') || content.includes('FROM ') || 
                       content.includes('WHERE ')) {
                code.className = 'language-sql';
                pre.className = 'language-sql';
            } else {
                // Default to Java for your blog
                code.className = 'language-java';
                pre.className = 'language-java';
            }
        }
        
        // Ensure pre also has the language class
        if (code.className && !pre.className.includes('language-')) {
            pre.className = code.className;
        }
    });
    
    // Manually highlight all code blocks since we disabled automatic highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }

    // Add copy button to code blocks
    document.querySelectorAll('pre').forEach(function(pre) {
        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        
        // Wrap pre in a container for positioning
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);
        
        // Copy functionality
        button.addEventListener('click', function() {
            const code = pre.querySelector('code');
            const text = code ? code.textContent : pre.textContent;
            
            navigator.clipboard.writeText(text).then(function() {
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                setTimeout(function() {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy:', err);
                button.textContent = 'Failed';
                setTimeout(function() {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
    });

    // Add line numbers to code blocks
    document.querySelectorAll('pre code').forEach(function(block) {
        const lines = block.textContent.split('\n');
        if (lines.length > 5) { // Only add line numbers for longer code blocks
            block.classList.add('line-numbers');
        }
    });
});