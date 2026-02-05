# Contributing to PromptFlow

Thank you for your interest in contributing to PromptFlow! This document will help you get started.

## How Can I Contribute?

### Reporting Bugs
Found a bug? Please open an issue using the Bug Report template. Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your ComfyUI version
- Screenshots if applicable

### Suggesting Features
Have an idea? Open a Feature Request issue! Describe:
- The problem you're trying to solve
- Your proposed solution
- Why it would benefit other users

### Code Contributions
Want to contribute code? Awesome! Here's how:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit** (`git commit -m 'Add amazing feature'`)
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Contribution Guidelines

### What We're Looking For

- **Bug fixes** - Always welcome!
- **New auto-sort keywords** - Improve categorization accuracy
- **Preset packs** - New style/quality/negative presets
- **Wildcard improvements** - Better parsing, new features
- **Documentation improvements** - Typos, clarity, examples
- **Performance optimizations** - Faster, more efficient code
- **UI/UX improvements** - Better user experience
- **New themes** - More color schemes (synced with FlowPath)

### What to Avoid

- Breaking changes without discussion
- Massive refactors without prior approval
- Removing existing features
- Adding dependencies without good reason
- Code without comments or documentation

## Code Style

### JavaScript
- Use clear, descriptive variable names
- Add comments for complex logic
- Use `const` and `let`, not `var`
- Prefer template literals over string concatenation
- Keep functions focused (do one thing well)

### Python
- Follow PEP 8 style guide
- Add docstrings to functions
- Use type hints where helpful
- Keep functions small and focused

### Example
```javascript
// Good
const parseWildcardOptions = (text) => {
  // Extract options from {option1|option2|option3} syntax
  if (!text || typeof text !== 'string') {
    return [];
  }
  // ... rest of function
};

// Bad
function p(t) {
  if(!t)return[];
  // ... no comments, unclear
}
```

## Testing Your Changes

Before submitting a PR:

1. **Test in ComfyUI** - Actually load and use your changes
2. **Test multiple scenarios** - Different modes, wildcards, presets
3. **Test error cases** - What happens with invalid input?
4. **Check console** - No unexpected errors or warnings
5. **Test with existing workflows** - Don't break backward compatibility

### Common Test Cases

- [ ] Simple mode works correctly
- [ ] Extended mode works correctly
- [ ] Inline wildcards `{a|b|c}` parse correctly
- [ ] File wildcards `__folder/file__` load correctly
- [ ] Auto-sort categorizes accurately
- [ ] Presets save/load correctly
- [ ] Variations node shows all combinations
- [ ] Theme changes apply immediately
- [ ] LoRA trigger words integrate properly
- [ ] Settings persist after restart

## Commit Messages

Write clear, descriptive commit messages:

```bash
# Good
git commit -m "Add support for nested wildcards"
git commit -m "Fix auto-sort keyword matching for lighting terms"
git commit -m "Update README with wildcard examples"

# Bad
git commit -m "fix"
git commit -m "updates"
git commit -m "asdf"
```

### Commit Message Format
```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring without behavior change
- `test:` Adding tests
- `chore:` Maintenance tasks

## Pull Request Process

1. **Open an Issue First** (for major changes)
   - Discuss your approach
   - Get feedback before coding
   - Avoid wasted effort

2. **Keep PRs Focused**
   - One feature/fix per PR
   - Don't mix unrelated changes
   - Smaller PRs = faster reviews

3. **Update Documentation**
   - Update README if needed
   - Add comments to complex code

4. **Fill Out PR Template**
   - Describe what changed
   - Explain why it's needed
   - Link related issues

5. **Be Patient and Responsive**
   - I'll review as soon as possible
   - Be open to feedback
   - Make requested changes promptly

## Adding Auto-Sort Keywords

Want to improve auto-sort accuracy? Here's how:

```javascript
// In the categorization keywords object
const CATEGORY_KEYWORDS = {
  subject: ['1girl', '1boy', 'portrait', ...],
  character: ['hair', 'eyes', 'skin', ...],
  expression: ['smiling', 'crying', 'angry', ...],
  // Add your keywords to the appropriate category
};
```

**Guidelines:**
- Add keywords to the most specific category
- Avoid overly generic terms
- Test with real prompts to verify accuracy

## Adding New Themes

Themes are shared with FlowPath! Add to both repos:

```javascript
// In promptflow_widget.js, add to THEMES object
const THEMES = {
  // ... existing themes
  your_theme_name: {
    primary: "#yourPrimaryColor",
    primaryLight: "#yourPrimaryLightColor",
    accent: "#yourAccentColor",
    background: "#yourBackgroundColor",
    text: "#yourTextColor"
  }
};
```

**Guidelines:**
- Choose colors with good contrast
- Test readability (text on backgrounds)
- Pick a memorable name
- Sync with FlowPath for consistency

## Questions?

- **Open an Issue** - For feature ideas or questions
- **Ko-fi** - For direct support: https://ko-fi.com/maartenharms

## Recognition

All contributors will be credited in:
- Release notes
- README (if significant contribution)
- Git commit history (forever)

Thank you for making PromptFlow better!

---

**By contributing, you agree that your contributions will be licensed under the MIT License.**
