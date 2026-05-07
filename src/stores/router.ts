import { createSignal } from "solid-js";

export type Page = "invoice" | "history" | "contacts";

const [currentPage, setCurrentPage] = createSignal<Page>("invoice");
const [savedId, setSavedId] = createSignal<number | null>(null);

export { currentPage, setCurrentPage, savedId, setSavedId };
