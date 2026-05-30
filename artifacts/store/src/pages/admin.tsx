import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useGetProductSummary, getListProductsQueryKey, getGetProductSummaryQueryKey,
  useListOrders,
} from "@workspace/api-client-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { useSettings, type SiteSettings } from "@/lib/settings-context";
import { Plus, Pencil, Trash2, Star, Package, Upload, Lock, ImageIcon, Settings, ShoppingBag, Save, MessageSquare, Truck, ClipboardList } from "lucide-react";
import { AdminReviews } from "@/components/admin-reviews";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "FINAE-ADMIN-2025";

type Product = {
  id: number; name: string; description: string; price: number;
  category: "pillowcases" | "sheets" | "towels" | "socks";
  imageUrl: string | null; inStock: boolean; featured: boolean;
  material?: string | null; colors?: string | null; sizes?: string | null; createdAt: string;
};

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0.01),
  category: z.enum(["pillowcases", "sheets", "towels", "socks"]),
  imageUrl: z.string().optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  material: z.string().optional(),
});
type ProductForm = z.infer<typeof productSchema>;

const inputClass = "w-full bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/40 px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-colors font-sans font-light tracking-wide";
const labelClass = "text-[10px] tracking-[0.2em] uppercase font-sans font-normal text-muted-foreground";

const COLOR_PRESETS = [
  { name: "Gold (default)", value: "#c9a84c" },
  { name: "Rose Gold", value: "#c9836a" },
  { name: "Silver", value: "#a8b0b8" },
  { name: "Emerald", value: "#4a9e6e" },
  { name: "Navy", value: "#4a6fa5" },
  { name: "Burgundy", value: "#9e4a5a" },
];

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { lang } = useLang();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("finae_admin", "1");
      onUnlock();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <Lock className="h-5 w-5 text-primary mx-auto mb-6" />
        <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-sans mb-2">
          {lang === "hr" ? "Admin pristup" : "Admin Access"}
        </p>
        <div className="w-8 h-px bg-primary/40 mx-auto mb-8" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder={lang === "hr" ? "Admin lozinka" : "Admin password"}
            className={`${inputClass} text-center tracking-[0.2em]`}
            autoFocus
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-destructive font-sans">
              {lang === "hr" ? "Pogrešna lozinka." : "Incorrect password."}
            </motion.p>
          )}
          <button type="submit" className="w-full bg-primary text-primary-foreground text-[11px] tracking-[0.25em] uppercase py-3.5 hover:bg-primary/90 transition-colors font-sans">
            {lang === "hr" ? "Ulaz" : "Enter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ImageUploader({ currentUrl, onUpload }: { currentUrl?: string; onUpload: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const { lang } = useLang();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setPreview(url);
      onUpload(url);
    } catch {
      alert(lang === "hr" ? "Upload slike nije uspio." : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => fileRef.current?.click()}
        className="w-full border border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer flex flex-col items-center justify-center py-5 gap-2 relative overflow-hidden"
      >
        {preview ? <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-40" /> : null}
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          {uploading
            ? <div className="h-4 w-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
            : <Upload className="h-4 w-4 text-primary/60" />}
          <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-muted-foreground">
            {uploading ? (lang === "hr" ? "Uploadam..." : "Uploading...") : preview ? (lang === "hr" ? "Promijeni sliku" : "Change image") : (lang === "hr" ? "Dodaj sliku" : "Add image")}
          </p>
          <p className="text-[9px] text-muted-foreground/50 font-sans">JPG, PNG, WEBP — max 10MB</p>
        </div>
      </div>
      {preview && (
        <div className="flex items-center gap-2">
          <ImageIcon className="h-3 w-3 text-primary/60 shrink-0" />
          <p className="text-[10px] font-sans text-muted-foreground truncate flex-1">{preview}</p>
          <button type="button" onClick={() => { setPreview(""); onUpload(""); }} className="text-[10px] font-sans text-muted-foreground/50 hover:text-destructive transition-colors shrink-0">
            {lang === "hr" ? "Ukloni" : "Remove"}
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ProductsTab() {
  const { data: products, isLoading } = useListProducts();
  const { data: summary } = useGetProductSummary();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, lang } = useLang();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, category: "pillowcases", inStock: true, featured: false },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetProductSummaryQueryKey() });
  }

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", description: "", price: 0, category: "pillowcases", inStock: true, featured: false, colors: "", sizes: "", material: "", imageUrl: "" });
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    form.reset({ name: p.name, description: p.description, price: p.price, category: p.category, imageUrl: p.imageUrl ?? "", inStock: p.inStock, featured: p.featured, colors: p.colors ?? "", sizes: p.sizes ?? "", material: p.material ?? "" });
    setDialogOpen(true);
  }

  function onSubmit(values: ProductForm) {
    if (editing) {
      updateProduct.mutate({ id: editing.id, data: values }, {
        onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: t.common.productUpdated }); },
        onError: () => toast({ title: t.common.failedUpdate, variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data: values }, {
        onSuccess: () => { invalidate(); setDialogOpen(false); toast({ title: t.common.productCreated }); },
        onError: () => toast({ title: t.common.failedCreate, variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`${lang === "hr" ? "Obriši" : "Delete"} "${name}"?`)) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: t.common.productDeleted }); },
      onError: () => toast({ title: t.common.failedDelete, variant: "destructive" }),
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted-foreground text-sm font-light">
          {summary ? `${summary.totalProducts} ${t.admin.products} · ${summary.featuredCount} ${t.admin.featured}` : t.admin.manage}
        </p>
        <button
          data-testid="button-add-product"
          onClick={openCreate}
          className="bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-6 py-3 flex items-center gap-2 hover:bg-primary/90 transition-colors font-sans"
        >
          <Plus className="h-3.5 w-3.5" /> {t.admin.addProduct}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/40 mb-8">
          {summary.categories.map((cat) => (
            <div key={cat.category} className="bg-card p-5">
              <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-sans mb-1">
                {t.admin.cats[cat.category as keyof typeof t.admin.cats] ?? cat.category}
              </p>
              <p className="font-serif text-3xl font-light">{cat.count}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-px">{[1, 2, 3, 4].map((n) => <div key={n} className="h-16 bg-card animate-pulse" />)}</div>
      ) : (
        <div className="space-y-px">
          {(products ?? []).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              data-testid={`row-product-${product.id}`}
              className="flex items-center gap-5 bg-card px-5 py-4 border-b border-border/40"
            >
              <div className="h-10 w-8 bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <Package className="h-3.5 w-3.5 text-muted-foreground/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-serif font-light truncate">{product.name}</p>
                  {product.featured && <Star className="h-3 w-3 text-primary fill-primary shrink-0" />}
                </div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-sans">{product.category}</p>
              </div>
              <p className="text-primary tracking-wide text-sm shrink-0">€{Number(product.price).toFixed(2)}</p>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  data-testid={`button-toggle-stock-${product.id}`}
                  onClick={() => updateProduct.mutate({ id: product.id, data: { inStock: !product.inStock } }, { onSuccess: invalidate })}
                  className={`text-[9px] tracking-[0.15em] uppercase font-sans px-2.5 py-1.5 border transition-colors ${product.inStock ? "border-primary/40 text-primary hover:bg-primary/5" : "border-border/40 text-muted-foreground hover:border-primary/20"}`}
                >
                  {product.inStock ? t.product.inStock : t.product.outOfStock}
                </button>
                <button
                  data-testid={`button-toggle-featured-${product.id}`}
                  onClick={() => updateProduct.mutate({ id: product.id, data: { featured: !product.featured } }, { onSuccess: invalidate })}
                  className={`p-1.5 transition-colors ${product.featured ? "text-primary" : "text-muted-foreground/30 hover:text-primary"}`}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button data-testid={`button-edit-${product.id}`} onClick={() => openEdit(product as Product)} className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button data-testid={`button-delete-${product.id}`} onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light">
              {editing ? t.admin.editProduct : t.admin.newProduct}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{t.admin.name}</FormLabel>
                  <FormControl><input data-testid="input-product-name" className={inputClass} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{t.admin.description}</FormLabel>
                  <FormControl><textarea rows={2} className={`${inputClass} resize-none`} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>{t.admin.price}</FormLabel>
                    <FormControl><input data-testid="input-product-price" type="number" step="0.01" className={inputClass} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>{t.admin.category}</FormLabel>
                    <FormControl>
                      <select data-testid="select-category" className={inputClass} value={field.value} onChange={field.onChange}>
                        <option value="pillowcases">{t.admin.cats.pillowcases}</option>
                        <option value="sheets">{t.admin.cats.sheets}</option>
                        <option value="towels">{t.admin.cats.towels}</option>
                        <option value="socks">{t.admin.cats.socks}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{lang === "hr" ? "Slika proizvoda" : "Product image"}</FormLabel>
                  <FormControl><ImageUploader currentUrl={field.value} onUpload={(url) => field.onChange(url)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="material" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{t.admin.material}</FormLabel>
                  <FormControl><input className={inputClass} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="colors" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{t.admin.colors}</FormLabel>
                  <FormControl><input placeholder={t.admin.colorPlaceholder} className={inputClass} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sizes" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>{t.admin.sizes}</FormLabel>
                  <FormControl><input placeholder={t.admin.sizePlaceholder} className={inputClass} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-6 pt-2">
                <FormField control={form.control} name="inStock" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><input data-testid="checkbox-in-stock" type="checkbox" checked={field.value} onChange={field.onChange} className="h-3.5 w-3.5 accent-primary" /></FormControl>
                    <FormLabel className={`${labelClass} cursor-pointer`}>{t.admin.inStock}</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><input data-testid="checkbox-featured" type="checkbox" checked={field.value} onChange={field.onChange} className="h-3.5 w-3.5 accent-primary" /></FormControl>
                    <FormLabel className={`${labelClass} cursor-pointer`}>{t.admin.featuredLabel}</FormLabel>
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="flex-1 border border-border/60 text-[11px] tracking-[0.2em] uppercase py-3 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-sans" onClick={() => setDialogOpen(false)}>
                  {t.admin.cancel}
                </button>
                <button
                  data-testid="button-save-product"
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase py-3 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {createProduct.isPending || updateProduct.isPending ? t.admin.saving : editing ? t.admin.save : t.admin.create}
                </button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingsTab() {
  const { settings, updateSettings, isSaving } = useSettings();
  const { toast } = useToast();
  const { lang } = useLang();
  const [local, setLocal] = useState<SiteSettings>({ ...settings });

  function set(key: keyof SiteSettings, value: string) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  async function save(section: Partial<SiteSettings>) {
    try {
      await updateSettings(section);
      toast({ title: lang === "hr" ? "Postavke su spremljene." : "Settings saved." });
    } catch {
      toast({ title: lang === "hr" ? "Greška pri spremanju." : "Failed to save.", variant: "destructive" });
    }
  }

  const S = (props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div className="space-y-1.5">
      <label className={labelClass}>{props.label}</label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={inputClass}
      />
    </div>
  );

  const Section = ({ title, children, onSave, keys }: { title: string; children: React.ReactNode; onSave: () => void; keys: (keyof SiteSettings)[] }) => {
    const changed = keys.some((k) => local[k] !== settings[k]);
    return (
      <div className="bg-card border border-border/40 p-6 space-y-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-sans">{title}</p>
        {children}
        <button
          onClick={onSave}
          disabled={isSaving || !changed}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? (lang === "hr" ? "Spremam..." : "Saving...") : (lang === "hr" ? "Spremi" : "Save")}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Branding */}
      <Section
        title={lang === "hr" ? "Branding" : "Branding"}
        keys={["store_name", "store_tagline"]}
        onSave={() => save({ store_name: local.store_name, store_tagline: local.store_tagline })}
      >
        <S label={lang === "hr" ? "Naziv firme / brenda" : "Store / brand name"} value={local.store_name} onChange={(v) => set("store_name", v)} placeholder="FINAE" />
        <S label={lang === "hr" ? "Tagline (opis u footeru)" : "Tagline (footer description)"} value={local.store_tagline} onChange={(v) => set("store_tagline", v)} placeholder="Everyday essentials..." />
      </Section>

      {/* Hero tekst */}
      <Section
        title={lang === "hr" ? "Naslovna stranica — Hero tekst" : "Homepage — Hero text"}
        keys={["hero_title", "hero_subtitle"]}
        onSave={() => save({ hero_title: local.hero_title, hero_subtitle: local.hero_subtitle })}
      >
        <S label={lang === "hr" ? "Naslov (veliki tekst)" : "Title (large text)"} value={local.hero_title} onChange={(v) => set("hero_title", v)} placeholder="Home goods for a slower pace." />
        <S label={lang === "hr" ? "Podnaslov" : "Subtitle"} value={local.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} placeholder="Premium pillowcases, sheets..." />
      </Section>

      {/* Traka obavijesti */}
      <Section
        title={lang === "hr" ? "Traka obavijesti (vrh stranice)" : "Announcement bar (top of page)"}
        keys={["announcement", "free_shipping_min", "currency_symbol"]}
        onSave={() => save({ announcement: local.announcement, free_shipping_min: local.free_shipping_min, currency_symbol: local.currency_symbol })}
      >
        <div className="space-y-1.5">
          <label className={labelClass}>{lang === "hr" ? "Poruka u traci (ostavi prazno za automatsku dostavu)" : "Announcement (leave blank for auto shipping msg)"}</label>
          <input
            type="text"
            value={local.announcement}
            onChange={(e) => set("announcement", e.target.value)}
            placeholder={lang === "hr" ? "Npr: Nova kolekcija dostupna!" : "e.g. New collection available!"}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <S label={lang === "hr" ? "Besplatna dostava od (iznos)" : "Free shipping from (amount)"} value={local.free_shipping_min} onChange={(v) => set("free_shipping_min", v)} placeholder="75" type="number" />
          <S label={lang === "hr" ? "Valuta (simbol)" : "Currency symbol"} value={local.currency_symbol} onChange={(v) => set("currency_symbol", v)} placeholder="€" />
        </div>
      </Section>

      {/* Kontakt */}
      <Section
        title={lang === "hr" ? "Kontakt" : "Contact"}
        keys={["contact_email"]}
        onSave={() => save({ contact_email: local.contact_email })}
      >
        <S label={lang === "hr" ? "Email adresa (prikazuje se u footeru)" : "Email address (shown in footer)"} value={local.contact_email} onChange={(v) => set("contact_email", v)} placeholder="hello@finae.com" type="email" />
      </Section>

      {/* Boje */}
      <div className="bg-card border border-border/40 p-6 space-y-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-sans">{lang === "hr" ? "Boja brenda" : "Brand color"}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => { set("primary_color", c.value); save({ primary_color: c.value }); }}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`h-10 w-full rounded-sm border-2 transition-all ${local.primary_color === c.value ? "border-foreground scale-105" : "border-transparent hover:border-foreground/30"}`}
                style={{ backgroundColor: c.value }}
              />
              <p className="text-[8px] tracking-[0.1em] uppercase text-muted-foreground font-sans text-center leading-tight">{c.name}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className={labelClass}>{lang === "hr" ? "Ili upiši hex boju:" : "Or enter hex color:"}</label>
          <input
            type="color"
            value={local.primary_color}
            onChange={(e) => set("primary_color", e.target.value)}
            className="h-8 w-14 cursor-pointer bg-transparent border border-border/60 p-0.5"
          />
          <input
            type="text"
            value={local.primary_color}
            onChange={(e) => set("primary_color", e.target.value)}
            className="w-28 bg-background border border-border/60 text-foreground px-3 py-1.5 text-sm focus:outline-none focus:border-primary/60 font-sans font-light tracking-wide"
            placeholder="#c9a84c"
          />
          <button
            onClick={() => save({ primary_color: local.primary_color })}
            disabled={isSaving || local.primary_color === settings.primary_color}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-[11px] tracking-[0.2em] uppercase px-4 py-2 hover:bg-primary/90 transition-colors font-sans disabled:opacity-40"
          >
            <Save className="h-3 w-3" />
            {lang === "hr" ? "Spremi" : "Save"}
          </button>
        </div>
      </div>

    </div>
  );
}

function AdminOrders() {
  const { data: orders, isLoading, refetch } = useListOrders();
  const { lang } = useLang();
  const { toast } = useToast();
  const [shipping, setShipping] = useState<number | null>(null);

  async function markShipped(id: number) {
    setShipping(id);
    try {
      const res = await fetch(`/api/orders/${id}/ship`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: lang === "hr" ? "Narudžba označena kao poslana!" : "Order marked as shipped!" });
      refetch();
    } catch {
      toast({ title: lang === "hr" ? "Greška pri ažuriranju." : "Update failed.", variant: "destructive" });
    } finally {
      setShipping(null);
    }
  }

  if (isLoading) return <div className="space-y-px">{[1,2,3].map(n => <div key={n} className="h-16 bg-card animate-pulse" />)}</div>;

  const list = (orders ?? []) as any[];

  if (list.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground font-light font-serif text-lg">
        {lang === "hr" ? "Još nema narudžbi." : "No orders yet."}
      </div>
    );
  }

  return (
    <div className="space-y-px">
      {list.map((order: any, idx: number) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="bg-card border-b border-border/40 px-5 py-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-serif font-light">#{order.id} — {order.customerName}</p>
                <span className={`text-[9px] tracking-[0.2em] uppercase font-sans px-2 py-0.5 border ${order.status === "shipped" ? "border-primary/40 text-primary" : "border-border/40 text-muted-foreground"}`}>
                  {order.status === "shipped" ? (lang === "hr" ? "Poslano" : "Shipped") : (lang === "hr" ? "Na čekanju" : "Pending")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-light">{order.customerEmail}</p>
              <p className="text-xs text-muted-foreground font-light truncate">{order.shippingAddress}</p>
              <div className="flex gap-4 mt-2">
                <p className="text-sm text-primary tracking-wide">€{Number(order.total).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground font-light">
                  {order.items?.length ?? 0} {lang === "hr" ? "stavki" : "items"} · {new Date(order.createdAt).toLocaleDateString(lang === "hr" ? "hr-HR" : "en-GB")}
                </p>
              </div>
            </div>
            {order.status !== "shipped" && (
              <button
                onClick={() => markShipped(order.id)}
                disabled={shipping === order.id}
                className="flex items-center gap-2 border border-primary/40 text-primary text-[10px] tracking-[0.2em] uppercase font-sans px-4 py-2.5 hover:bg-primary/5 transition-colors disabled:opacity-40 shrink-0"
              >
                <Truck className="h-3 w-3" />
                {shipping === order.id ? "..." : (lang === "hr" ? "Označi poslano" : "Mark shipped")}
              </button>
            )}
          </div>
          {order.items && order.items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/20 flex flex-wrap gap-x-4 gap-y-1">
              {order.items.map((item: any) => (
                <p key={item.id} className="text-[10px] font-sans text-muted-foreground">
                  {item.productName} ×{item.quantity} — €{Number(item.price).toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function Admin() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("finae_admin") === "1");
  const [tab, setTab] = useState<"products" | "orders" | "reviews" | "settings">("products");
  const { t, lang } = useLang();
  const { settings } = useSettings();

  if (!unlocked) return <AdminLogin onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="container mx-auto px-6 md:px-10 py-14 md:py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-3 font-sans">{settings.store_name} — {t.admin.title}</p>
          <div className="divider-gold" />
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("finae_admin"); setUnlocked(false); }}
          className="border border-border/40 text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors font-sans flex items-center gap-1.5"
        >
          <Lock className="h-3 w-3" />
          {lang === "hr" ? "Odjava" : "Lock"}
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-px mb-10 border-b border-border/40 flex-wrap">
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-sans px-6 py-3 transition-colors border-b-2 -mb-px ${tab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {lang === "hr" ? "Proizvodi" : "Products"}
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-sans px-6 py-3 transition-colors border-b-2 -mb-px ${tab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {lang === "hr" ? "Narudžbe" : "Orders"}
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-sans px-6 py-3 transition-colors border-b-2 -mb-px ${tab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {lang === "hr" ? "Recenzije" : "Reviews"}
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-sans px-6 py-3 transition-colors border-b-2 -mb-px ${tab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Settings className="h-3.5 w-3.5" />
          {lang === "hr" ? "Postavke" : "Settings"}
        </button>
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "orders" && (
        <div>
          <p className="text-muted-foreground text-sm font-light mb-6">
            {lang === "hr" ? "Sve narudžbe — klikni 'Označi poslano' kad pošalješ paket." : "All orders — click 'Mark shipped' when you send the package."}
          </p>
          <AdminOrders />
        </div>
      )}
      {tab === "reviews" && (
        <div>
          <p className="text-muted-foreground text-sm font-light mb-6">
            {lang === "hr" ? "Recenzije čekaju odobrenje — odobri ili obriši svaku." : "Reviews awaiting approval — approve or delete each one."}
          </p>
          <AdminReviews />
        </div>
      )}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}
