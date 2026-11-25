"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { getLocality, SINGLE_LOCALITY, type LocalityId } from "@/config/branches";
import { BRAND } from "@/config/brand";
import { getFlavor } from "@/config/flavors";
import { MAX_QTY_PER_ITEM, type SizeId } from "@/config/products";
import { cartTotals, newId, sanitizeItems, type CartItem } from "@/lib/cart";
import type { CheckoutData, DeliveryMethod } from "@/lib/whatsapp";

const STORAGE_KEY = BRAND.storageKey;

type Draft = Omit<CheckoutData, "localityId">;

interface PersistState {
  localityId: LocalityId | null;
  items: CartItem[];
  pending: string[];
  draft: Draft;
}

/** Forma de entrega inicial según las opciones activas en brand.ts */
const DEFAULT_METHOD: DeliveryMethod = BRAND.features.delivery ? "delivery" : "retiro";
const singleStore = SINGLE_LOCALITY && SINGLE_LOCALITY.stores.length === 1 ? SINGLE_LOCALITY.stores[0].id : null;
const EMPTY_DRAFT: Draft = { name: "", method: DEFAULT_METHOD, address: "", storeId: singleStore, notes: "" };
// con una sola localidad, queda elegida desde el inicio
const INITIAL: PersistState = { localityId: SINGLE_LOCALITY?.id ?? null, items: [], pending: [], draft: EMPTY_DRAFT };

type Action =
  | { type: "hydrate"; state: PersistState }
  | { type: "locality"; id: LocalityId }
  | { type: "add"; item: CartItem }
  | { type: "update"; id: string; flavors: string[] }
  | { type: "qty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "togglePending"; id: string }
  | { type: "clearPending" }
  | { type: "draft"; patch: Partial<Draft> };

function reducer(s: PersistState, a: Action): PersistState {
  switch (a.type) {
    case "hydrate":
      return a.state;
    case "locality": {
      if (s.localityId === a.id) return s;
      const loc = getLocality(a.id);
      // al cambiar de localidad se reinicia la sucursal de retiro
      const storeId = loc && loc.stores.length === 1 ? loc.stores[0].id : null;
      return { ...s, localityId: a.id, draft: { ...s.draft, storeId } };
    }
    case "add":
      return { ...s, items: [...s.items, a.item] };
    case "update":
      return { ...s, items: s.items.map((it) => (it.id === a.id ? { ...it, flavors: a.flavors } : it)) };
    case "qty":
      return {
        ...s,
        items: s.items.map((it) =>
          it.id === a.id ? { ...it, qty: Math.min(MAX_QTY_PER_ITEM, Math.max(1, a.qty)) } : it,
        ),
      };
    case "remove":
      return { ...s, items: s.items.filter((it) => it.id !== a.id) };
    case "clear":
      return { ...s, items: [] };
    case "togglePending":
      return {
        ...s,
        pending: s.pending.includes(a.id) ? s.pending.filter((x) => x !== a.id) : [...s.pending, a.id],
      };
    case "clearPending":
      return { ...s, pending: [] };
    case "draft":
      return { ...s, draft: { ...s.draft, ...a.patch } };
  }
}

function load(): PersistState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const o = JSON.parse(raw) as Partial<PersistState>;
    const loc = getLocality(o.localityId ?? null) ?? SINGLE_LOCALITY ?? undefined;
    const d = (o.draft ?? {}) as Partial<Draft>;
    let method: DeliveryMethod = d.method === "retiro" ? "retiro" : "delivery";
    if (method === "delivery" && !BRAND.features.delivery) method = "retiro";
    if (method === "retiro" && !BRAND.features.pickup) method = "delivery";
    return {
      localityId: loc?.id ?? null,
      items: sanitizeItems(o.items),
      pending: Array.isArray(o.pending) ? o.pending.map(String).filter((id) => getFlavor(id)) : [],
      draft: {
        name: typeof d.name === "string" ? d.name.slice(0, 80) : "",
        method,
        address: typeof d.address === "string" ? d.address.slice(0, 200) : "",
        storeId: loc?.stores.some((st) => st.id === d.storeId) ? (d.storeId as string) : loc?.stores.length === 1 ? loc.stores[0].id : null,
        notes: typeof d.notes === "string" ? d.notes.slice(0, 400) : "",
      },
    };
  } catch {
    return INITIAL;
  }
}

export type CartStep = "cart" | "checkout" | "sent";

interface PickerState {
  sizeId: SizeId;
  editId?: string;
}

/** Último helado agregado: alimenta la confirmación "Finalizar pedido / Agregar otro". */
export interface AddedItem {
  key: number;
  sizeId: SizeId;
  flavors: string[];
  qty: number;
}

interface Toast {
  key: number;
  title: string;
  detail?: string;
}

interface OrderContextValue extends PersistState {
  hydrated: boolean;
  subtotal: number;
  count: number;
  // localidad
  requestLocality: (id: LocalityId) => void;
  localityPrompt: LocalityId | null;
  confirmLocality: () => void;
  cancelLocality: () => void;
  // carrito
  addItem: (sizeId: SizeId, flavors: string[], qty?: number) => void;
  updateItem: (id: string, flavors: string[]) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  // sabores elegidos desde la sección "Sabores"
  togglePending: (id: string) => void;
  clearPending: () => void;
  // datos de entrega
  setDraft: (patch: Partial<Draft>) => void;
  // interfaz
  cartOpen: boolean;
  cartStep: CartStep;
  openCart: (step?: CartStep) => void;
  closeCart: () => void;
  setCartStep: (s: CartStep) => void;
  picker: PickerState | null;
  openPicker: (sizeId: SizeId, editId?: string) => void;
  closePicker: () => void;
  toast: Toast | null;
  bump: number;
  lastAdded: AddedItem | null;
  dismissAdded: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [localityPrompt, setLocalityPrompt] = useState<LocalityId | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<CartStep>("cart");
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [bump, setBump] = useState(0);
  const [lastAdded, setLastAdded] = useState<AddedItem | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch({ type: "hydrate", state: load() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* almacenamiento no disponible: el pedido sigue funcionando en memoria */
    }
  }, [state, hydrated]);

  // sincroniza entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "hydrate", state: load() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showToast = useCallback((title: string, detail?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ key: Date.now(), title, detail });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const requestLocality = useCallback(
    (id: LocalityId) => {
      if (state.localityId && state.localityId !== id && state.items.length > 0) {
        setLocalityPrompt(id);
        return;
      }
      dispatch({ type: "locality", id });
    },
    [state.localityId, state.items.length],
  );

  const confirmLocality = useCallback(() => {
    if (localityPrompt) {
      dispatch({ type: "locality", id: localityPrompt });
      showToast(`Pedido para ${getLocality(localityPrompt)?.name}`, "Cambiamos la sucursal que recibe tu pedido.");
    }
    setLocalityPrompt(null);
  }, [localityPrompt, showToast]);

  const addItem = useCallback(
    (sizeId: SizeId, flavors: string[], qty = 1) => {
      dispatch({ type: "add", item: { id: newId(), sizeId, flavors, qty } });
      setBump((b) => b + 1);
      // en lugar de un aviso pasajero, se muestra la confirmación con los próximos pasos
      setLastAdded({ key: Date.now(), sizeId, flavors: [...flavors], qty });
    },
    [],
  );

  const totals = useMemo(() => cartTotals(state.items), [state.items]);

  const value: OrderContextValue = {
    ...state,
    hydrated,
    subtotal: totals.subtotal,
    count: totals.count,
    requestLocality,
    localityPrompt,
    confirmLocality,
    cancelLocality: () => setLocalityPrompt(null),
    addItem,
    updateItem: (id, flavors) => {
      dispatch({ type: "update", id, flavors });
      showToast("Sabores actualizados");
    },
    setQty: (id, qty) => dispatch({ type: "qty", id, qty }),
    removeItem: (id) => dispatch({ type: "remove", id }),
    clearCart: () => dispatch({ type: "clear" }),
    togglePending: (id) => dispatch({ type: "togglePending", id }),
    clearPending: () => dispatch({ type: "clearPending" }),
    setDraft: (patch) => dispatch({ type: "draft", patch }),
    cartOpen,
    cartStep,
    openCart: (step = "cart") => {
      setCartStep(step);
      setCartOpen(true);
    },
    closeCart: () => setCartOpen(false),
    setCartStep,
    picker,
    openPicker: (sizeId, editId) => setPicker({ sizeId, editId }),
    closePicker: () => setPicker(null),
    toast,
    bump,
    lastAdded,
    dismissAdded: () => setLastAdded(null),
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de <OrderProvider>");
  return ctx;
}
