# Glow

Glow is a programming language designed on top of Go, designed to bring more flexible and feature-rich syntax to the already incredibly lightweight and fast Go language.

## Why?
- Go is, by design, a very minimalistic language. This comes with its own advantages including fast compilation and runtime performance, however it also comes at the cost of many features that one would expect from a modern programming language.
- Go as a language lacks syntactical sugar. This, as well, is a design choice, however this can be frustrating to programmers coming from languages such as C++ or Javascript.
- Go's syntax is, while distinctive, somewhat unconventional, which can be jarring coming from other C-based languages.
- Glow works functionally the same--if you are familiar with Go, transitioning to Glow is easy.

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


