# Glow

Glow is a programming language designed on top of Go, designed to bring more flexible and feature-rich syntax to the already incredibly lightweight and fast Go language.

## Why?
- Go is, by design, a very minimalistic language. This comes with its own advantages including fast compilation and runtime performance, however it also comes at the cost of many features that one would expect from a modern programming language.
- Go as a language lacks syntactical sugar. This, as well, is a design choice, however this can be frustrating to programmers coming from languages such as C++ or Javascript.
- Go's syntax is, while distinctive, somewhat unconventional, which can be jarring coming from other C-based languages.
- Glow works functionally the same--if you are familiar with Go, transitioning to Glow is easy.

## Golang / Disadvantages
Go makes design choices that, while supported by valid reasoning, in practice, are often cumbersome and make programming in Go more difficult than is necessary.

Go has an *opinionated compiler*, which means that certain stylistic choices are enforced by the language itself. For instance, adding unused or "dead" code will result in a compiler error. While in theory, there is no reason why unused code should be included in a codebase. According to the Go docs,

> The presence of an unused variable may indicate a bug [...] Go refuses to compile programs with unused variables or imports, trading short-term convenience for long-term build speed and program clarity.

While this may be true in some cases, a lot of times, development happens incrementally; code may be written that is meant for use in the future and may not be used in the short-term. Commenting this temporarily unused code out would only add more confusion as additional comments are needed to clarify that this code is commented in order to prevent the Go compiler from compilaining.

## Glow by Example

```swift
var a = 1
var b: int

func add(a: int, b: int) {
    return a+b
}
```

```swift
struct Circle {
    radius: int
    
    get_area() {
        const pi = 3.1459
        return pi * this.radius * this.radius
    }
}

var circle = Circle {radius: 5}
```


