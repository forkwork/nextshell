// NextShell Workflows
window.WORKFLOWS = {
    // Add your workflow definitions here
    help: {
        description: "Show available commands",
        execute: function() {
            return "Available commands:\n" +
                   "  help - Show this help message\n" +
                   "  clear - Clear the terminal\n" +
                   "  themes - List available themes";
        }
    },
    clear: {
        description: "Clear the terminal",
        execute: function() {
            document.getElementById('terminal-content').innerHTML = '';
            return "Terminal cleared";
        }
    },
    themes: {
        description: "List available themes",
        execute: function() {
            return "Available themes:\n" +
                   "  default - Default theme\n" +
                   "  dark - Dark theme\n" +
                   "  light - Light theme";
        }
    }
}; 