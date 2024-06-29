class Scroll {
  toTop() {
    window.scrollTo(0, 0);
  }

  toBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}

export { Scroll };
