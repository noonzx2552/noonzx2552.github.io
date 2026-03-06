interface SplitOptions {
  linesClass?: string;
}

export interface SimpleSplitText {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  revert: () => void;
}

export function createSplitText(
  target: string | HTMLElement | Array<string | HTMLElement>,
  options: SplitOptions = {}
): SimpleSplitText {
  const elements = resolveTargets(target);
  const originalMarkup = elements.map((element) => element.innerHTML);
  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const lines: HTMLElement[] = [];

  elements.forEach((element) => {
    const text = element.innerText?.replace(/\r/g, "") ?? "";
    element.textContent = "";

    if (options.linesClass) {
      element.classList.add(options.linesClass);
    }
    lines.push(element);

    if (!text) return;

    const textLines = text.split("\n");
    textLines.forEach((line, lineIndex) => {
      const lineWords = line.trim().split(/\s+/).filter(Boolean);
      lineWords.forEach((word, wordIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "pre";
        words.push(wordSpan);

        [...word].forEach((char) => {
          const charSpan = document.createElement("span");
          charSpan.style.display = "inline-block";
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
          chars.push(charSpan);
        });

        element.appendChild(wordSpan);
        if (wordIndex < lineWords.length - 1) {
          element.appendChild(document.createTextNode(" "));
        }
      });

      if (lineIndex < textLines.length - 1) {
        element.appendChild(document.createElement("br"));
      }
    });
  });

  return {
    chars,
    words,
    lines,
    revert: () => {
      elements.forEach((element, index) => {
        element.innerHTML = originalMarkup[index];
        if (options.linesClass) {
          element.classList.remove(options.linesClass);
        }
      });
    },
  };
}

function resolveTargets(
  target: string | HTMLElement | Array<string | HTMLElement>
): HTMLElement[] {
  const input = Array.isArray(target) ? target : [target];
  const elements: HTMLElement[] = [];

  input.forEach((entry) => {
    if (typeof entry === "string") {
      document.querySelectorAll<HTMLElement>(entry).forEach((element) => {
        elements.push(element);
      });
    } else if (entry instanceof HTMLElement) {
      elements.push(entry);
    }
  });

  return elements;
}
