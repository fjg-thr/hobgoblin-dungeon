interface PointerEventLike {
  stopPropagation?: () => void;
}

export const stopPointerEventPropagation = (event?: PointerEventLike) => {
  event?.stopPropagation?.();
};
