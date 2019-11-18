# Contributing to Hyperapp Debug

Thank you for taking the time to read our contribution guidelines.
You can start contributing in many ways like filing bug reports, improving the documentation, or helping others.

Our open source community strives to be nice, welcoming and professional.
Instances of abusive, harassing, or otherwise unacceptable behavior will not be tolerated.

## Making issues

There are a few good places to look before making an issue.

 - [Devtool Feature Requests](https://github.com/mrozbarry/hyperapp-debug/issues/7). This issue is a great place to see request features, and vote/thumbs-up features that you would like to see.
 - [Search for similar issues](https://github.com/mrozbarry/hyperapp-debug/issues). Maybe someone has already found the bug you just found, and there's a plan to fix it.

If you're reporting a bug, make sure you specify if the bug is related to the devtool or the `withDebug()` app wrapper, and leave steps on how to reproduce the bug.
If it's easy to do, use something like codepen, or codesandbox, and show me your relevant code.

## Style

Language and versions in use

| Project | Language | Reasons |
| ------- | -------- | ------- |
| Devtool | Browser-compatible es6 | Some pieces of browser extensions don't fully follow es6, and using tools like babel make it difficult to get the latest extension updates reviewed. We will not be accepting compiled languages for this in the foreseeable future. |
| withDebug | Babel-powered es6 | Between using parcel and microbundle, transpiling isn't a big problem for npm. I am not interested in using Typescript or other compile-to-js tools, since that increases the barrier to contributing. |

* We are currently using eslint exclusively for code linting and styling. Please ensure that any contributions follow the current eslint rules.

## Bugs

* Before submitting a bug report, search the issues for similar tickets. Your issue may have already been discussed and resolved. Feel free to add a comment to an existing ticket, even if it's closed.
* If you have a question or need help with something you are building, hop on [Slack](https://hyperappjs.herokuapp.com) and go to the #hyperapp-debug channel.
* Be thorough in your title and report, don't leave out important details, describe your setup and [include any relevant code](https://en.wikipedia.org/wiki/Minimal_Working_Example) with your issue.
* Please use GitHub [fenced code blocks](https://help.github.com/articles/creating-and-highlighting-code-blocks/) when sharing code. If your code has JSX in it, use <samp>```jsx</samp> for best syntax highlighting.

## Tests

 * TBD. Probably sticking with ava.

## Attribution

This document was originally from [Hyperapp v1's contributing guidelines](https://github.com/jorgebucaran/hyperapp/blob/V1/CONTRIBUTING.md), with modification.
