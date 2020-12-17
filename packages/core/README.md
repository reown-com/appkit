# Web3Modal-TS

Fork of https://github.com/Web3Modal/web3modal, without any React or visual component implemented. Just the typescript core.

## Motivation

Web3Modal is a very useful and easy to use library, that allows developers to add support for multiple providers in their apps with a simple customizable configuration. 

However, the original package uses React and its bundled vanilla JS version also has React bundled with it. Therefore, separating the typescript core from the React data providers and visual components is particularly useful, not only to allow full customization of the UI, but can also serve as a starting point for implementations in other frameworks like Angular and VueJS.