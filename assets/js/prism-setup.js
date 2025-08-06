// Prism.js setup for enhanced syntax highlighting
document.addEventListener('DOMContentLoaded', function() {
    // Add language class to code blocks without one
    document.querySelectorAll('pre code').forEach(function(block) {
        // Check if the code block already has a language class
        if (!block.className || !block.className.includes('language-')) {
            // Try to detect Java code by looking for common Java keywords
            const code = block.textContent;
            if (code.includes('public class') || code.includes('import java') || 
                code.includes('public static void') || code.includes('private ') ||
                code.includes('extends ') || code.includes('implements ')) {
                block.className = 'language-java';
            } else if (code.includes('function') || code.includes('const ') || 
                       code.includes('let ') || code.includes('var ')) {
                block.className = 'language-javascript';
            } else if (code.includes('def ') || code.includes('import ') && code.includes('from ')) {
                block.className = 'language-python';
            } else if (code.includes('SELECT ') || code.includes('FROM ') || 
                       code.includes('WHERE ')) {
                block.className = 'language-sql';
            } else {
                // Default to Java for your blog
                block.className = 'language-java';
            }
        }
    });

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