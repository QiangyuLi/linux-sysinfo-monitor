# Linux System Info Monitor - Build and Package Script

## Install vsce if not already installed
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce (Visual Studio Code Extension Manager)..."
    npm install -g vsce
fi

## Build the extension
echo "Building extension..."
npm run compile

## Package the extension
echo "Packaging extension..."
vsce package

echo "✅ Extension packaged successfully!"
echo "You can now install the .vsix file in VS Code using:"
echo "code --install-extension linux-sysinfo-monitor-0.0.1.vsix"
