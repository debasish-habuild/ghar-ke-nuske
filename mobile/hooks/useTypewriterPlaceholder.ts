import { useEffect, useMemo, useState } from "react";

type Options = {
  startDelay?: number;
  typeDelay?: number;
  deleteDelay?: number;
  holdDelay?: number;
  nextDelay?: number;
};

const DEFAULT_OPTIONS: Required<Options> = {
  startDelay: 350,
  typeDelay: 70,
  deleteDelay: 35,
  holdDelay: 1400,
  nextDelay: 250,
};

export function useTypewriterPlaceholder(
  phrases: string[],
  fallback: string,
  options: Options = {},
) {
  const [text, setText] = useState("");
  const timings = { ...DEFAULT_OPTIONS, ...options };
  const cleanPhrases = useMemo(
    () => phrases.map((p) => p.trim()).filter(Boolean),
    [phrases],
  );

  useEffect(() => {
    if (!cleanPhrases.length) {
      setText(fallback);
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = (delay: number) => {
      timer = setTimeout(tick, delay);
    };

    const tick = () => {
      if (cancelled) return;

      const phrase = cleanPhrases[phraseIndex];
      if (!deleting) {
        charIndex = Math.min(charIndex + 1, phrase.length);
        setText(phrase.slice(0, charIndex));

        if (charIndex === phrase.length) {
          deleting = true;
          schedule(timings.holdDelay);
        } else {
          schedule(timings.typeDelay);
        }
        return;
      }

      charIndex = Math.max(charIndex - 1, 0);
      setText(phrase.slice(0, charIndex));

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % cleanPhrases.length;
        schedule(timings.nextDelay);
      } else {
        schedule(timings.deleteDelay);
      }
    };

    setText("");
    schedule(timings.startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    cleanPhrases,
    fallback,
    timings.deleteDelay,
    timings.holdDelay,
    timings.nextDelay,
    timings.startDelay,
    timings.typeDelay,
  ]);

  return text || fallback;
}
