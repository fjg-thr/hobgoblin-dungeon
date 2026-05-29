interface PointerEventLike {
  stopPropagation?: unknown;
}

export const stopPointerEventPropagation = (event?: PointerEventLike) => {
  if (typeof event?.stopPropagation !== "function") {
    return;
  }

  event.stopPropagation();
};
