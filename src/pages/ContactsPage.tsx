import { createSignal, createResource, For, Show } from "solid-js";
import { dbGetContacts, dbSaveContact, dbUpdateContact, dbDeleteContact } from "../services/db";
import type { ContactRow } from "../types/invoice";

function emptyContact(type: "seller" | "buyer"): Omit<ContactRow, "id"> {
  return { type, name: "", address: "", taxId: "", branch: "สำนักงานใหญ่", phone: "" };
}

export function ContactsPage() {
  const [tab, setTab] = createSignal<"seller" | "buyer">("seller");

  return (
    <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div class="flex items-center gap-3 p-4 bg-base-200 border-b border-base-300 shrink-0">
        <i class="ri-contacts-book-line text-primary text-lg" />
        <h2 class="font-bold text-base">รายชื่อผู้ติดต่อ</h2>
        <div class="flex-1" />
        <div class="tabs tabs-box tabs-sm">
          <button
            class={`tab ${tab() === "seller" ? "tab-active" : ""}`}
            onClick={() => setTab("seller")}
          >
            <i class="ri-store-2-line mr-1" />ผู้ขาย
          </button>
          <button
            class={`tab ${tab() === "buyer" ? "tab-active" : ""}`}
            onClick={() => setTab("buyer")}
          >
            <i class="ri-user-3-line mr-1" />ผู้ซื้อ
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <Show when={tab() === "seller"}>
          <ContactList type="seller" />
        </Show>
        <Show when={tab() === "buyer"}>
          <ContactList type="buyer" />
        </Show>
      </div>
    </div>
  );
}

function ContactList(props: { type: "seller" | "buyer" }) {
  const [contacts, { refetch }] = createResource(
    () => props.type,
    dbGetContacts,
    { initialValue: [] },
  );
  const [editing, setEditing] = createSignal<ContactRow | null>(null);
  const [adding, setAdding] = createSignal(false);
  const [form, setForm] = createSignal(emptyContact(props.type));

  function startAdd() {
    setForm(emptyContact(props.type));
    setEditing(null);
    setAdding(true);
  }

  function startEdit(c: ContactRow) {
    setForm({ type: c.type, name: c.name, address: c.address, taxId: c.taxId, branch: c.branch, phone: c.phone });
    setEditing(c);
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setEditing(null);
  }

  async function handleSave() {
    const f = form();
    if (!f.name.trim()) return;
    const ed = editing();
    if (ed?.id != null) {
      await dbUpdateContact(ed.id, f);
    } else {
      await dbSaveContact(f);
    }
    cancel();
    refetch();
  }

  async function handleDelete(c: ContactRow) {
    if (!confirm(`ลบ "${c.name}" ใช่หรือไม่?`)) return;
    await dbDeleteContact(c.id!);
    refetch();
  }

  const isOpen = (c: ContactRow) => editing()?.id === c.id;

  return (
    <div class="flex flex-col gap-3">
      {/* Add form */}
      <Show when={adding()}>
        <ContactForm
          form={form()}
          onChange={(f) => setForm(f)}
          onSave={handleSave}
          onCancel={cancel}
          title="เพิ่มรายชื่อใหม่"
        />
      </Show>

      <Show when={contacts.loading}>
        <div class="flex justify-center py-10">
          <span class="loading loading-spinner loading-md text-primary" />
        </div>
      </Show>

      <Show when={!contacts.loading && (contacts() ?? []).length === 0 && !adding()}>
        <div class="flex flex-col items-center justify-center h-40 gap-3 text-base-content/40">
          <i class="ri-user-search-line text-5xl" />
          <p class="text-sm">ยังไม่มีรายชื่อ{props.type === "seller" ? "ผู้ขาย" : "ผู้ซื้อ"}</p>
        </div>
      </Show>

      <For each={contacts() ?? []}>
        {(c) => (
          <div class="bg-base-200 border border-base-300 rounded-box">
            {/* Contact header row */}
            <div class="flex items-center gap-3 p-3">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm truncate">{c.name}</div>
                <div class="text-xs text-base-content/60 truncate">
                  {c.taxId ? `เลขผู้เสียภาษี: ${c.taxId}` : c.phone || ""}
                </div>
              </div>
              <button class="btn btn-ghost btn-xs gap-1" onClick={() => isOpen(c) ? cancel() : startEdit(c)}>
                <i class={isOpen(c) ? "ri-close-line" : "ri-edit-line"} />
                {isOpen(c) ? "ยกเลิก" : "แก้ไข"}
              </button>
              <button class="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(c)}>
                <i class="ri-delete-bin-line" />
              </button>
            </div>

            {/* Inline edit form */}
            <Show when={isOpen(c)}>
              <div class="border-t border-base-300 p-3">
                <ContactForm
                  form={form()}
                  onChange={(f) => setForm(f)}
                  onSave={handleSave}
                  onCancel={cancel}
                  title="แก้ไขรายชื่อ"
                />
              </div>
            </Show>
          </div>
        )}
      </For>

      {/* Add button */}
      <Show when={!adding()}>
        <button class="btn btn-outline btn-sm gap-2" onClick={startAdd}>
          <i class="ri-user-add-line" />
          เพิ่มรายชื่อ{props.type === "seller" ? "ผู้ขาย" : "ผู้ซื้อ"}
        </button>
      </Show>
    </div>
  );
}

function ContactForm(props: {
  form: Omit<ContactRow, "id">;
  onChange: (f: Omit<ContactRow, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  const f = () => props.form;
  const upd = (field: keyof Omit<ContactRow, "id" | "type">, val: string) =>
    props.onChange({ ...f(), [field]: val });

  return (
    <div class="bg-base-100 border border-base-300 rounded-box p-4 flex flex-col gap-3">
      <p class="font-semibold text-sm text-primary">{props.title}</p>

      <div class="grid grid-cols-1 gap-2">
        <fieldset class="fieldset p-0">
          <legend class="fieldset-legend">ชื่อ / บริษัท <span class="text-error">*</span></legend>
          <label class="input input-sm w-full">
            <input type="text" placeholder="ชื่อบริษัทหรือผู้ประกอบการ"
              value={f().name} onInput={(e) => upd("name", e.currentTarget.value)} />
          </label>
        </fieldset>

        <fieldset class="fieldset p-0">
          <legend class="fieldset-legend">ที่อยู่</legend>
          <textarea class="textarea textarea-sm w-full" rows="2" placeholder="ที่อยู่"
            value={f().address} onInput={(e) => upd("address", e.currentTarget.value)} />
        </fieldset>

        <div class="grid grid-cols-2 gap-2">
          <fieldset class="fieldset p-0">
            <legend class="fieldset-legend">เลขประจำตัวผู้เสียภาษี</legend>
            <label class="input input-sm w-full">
              <input type="text" maxlength="13" placeholder="0000000000000"
                value={f().taxId} onInput={(e) => upd("taxId", e.currentTarget.value)} />
            </label>
          </fieldset>
          <fieldset class="fieldset p-0">
            <legend class="fieldset-legend">สาขา</legend>
            <label class="input input-sm w-full">
              <input type="text" placeholder="สำนักงานใหญ่"
                value={f().branch} onInput={(e) => upd("branch", e.currentTarget.value)} />
            </label>
          </fieldset>
        </div>

        <fieldset class="fieldset p-0">
          <legend class="fieldset-legend">โทรศัพท์</legend>
          <label class="input input-sm w-full">
            <i class="ri-phone-line text-base-content/40 text-sm" />
            <input type="tel" placeholder="02-xxx-xxxx"
              value={f().phone} onInput={(e) => upd("phone", e.currentTarget.value)} />
          </label>
        </fieldset>
      </div>

      <div class="flex gap-2 justify-end">
        <button class="btn btn-ghost btn-sm" onClick={props.onCancel}>ยกเลิก</button>
        <button class="btn btn-primary btn-sm gap-2" onClick={props.onSave}>
          <i class="ri-save-line" />บันทึก
        </button>
      </div>
    </div>
  );
}
