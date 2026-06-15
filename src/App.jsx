import { useState, useEffect, useRef } from "react";
import { supabase, mapRow, mapToRow } from './supabase.js';

const LANG_KEY = "snackcheck-lang";

const LANGS = {
  nl: { appSub:"Snack beoordelingstool", allSnacks:"Alle snacks", myRatings:"Mijn ratings", search:"Zoek merk of product...", addRating:"Beoordelen", close:"✕ Sluiten", save:"Opslaan ✓", saved:"Opgeslagen!", savedSub:"Jouw beoordeling is toegevoegd.", back:"← Terug", reviews:"Beoordelingen", rateFirst:"Eerste snack beoordelen →", noRatings:"Nog geen snacks beoordeeld", noRatingsSub:"Voeg de eerste toe via de + knop", noMyRatings:"Nog geen ratings van", welcomed:"Welkom bij SnackCheck", welcomeSub:"Hoe mogen we je noemen?", yourName:"Jouw naam", namePh:"bijv. Shou", start:"Aan de slag →", brand:"Merk", brandPh:"bijv. Lays, Haribo, AH", product:"Productnaam", productPh:"bijv. Ovenbaked, Borrelnoten", flavor:"Smaak / Variant", flavorPh:"bijv. Paprika, Zeezout", category:"Categorie", rating:"Beoordeling", pros:"Pluspunten", prosPh:"bijv. Krokant, Lekker zout", cons:"Minpunten", consPh:"bijv. Te vet, Weinig smaak", photo:"Foto", photoOptional:"(optioneel)", photoTap:"Tik om een foto toe te voegen", minScore:"Min. score", onlyMulti:"Alleen 2+ ratings", reset:"✕ Reset", comma:"(komma gescheiden)", required:"*", scoreLabels:["","😕 Slecht","😐 Matig","🙂 Oké","😋 Goed","🤩 Geweldig!"], rated:"Beoordeeld", avgScore:"Gem. score", categories:"Categorieën", ratingsCount:(n)=>`${n} beoordeling${n!==1?"en":""}`, products:(n)=>`${n} product${n!==1?"en":""}`, myRatingsCount:(n,name)=>`${n} beoordeling${n!==1?"en":""} van ${name}`, you:" (jij)", sorts:["Nieuwste eerst","Oudste eerst","Hoogste score","Laagste score","Meest beoordeeld","A → Z"], cats:["Alles","Chips","Koek","Noten","Snoep","Choco","Puffs","Anders"] },
  en: { appSub:"Snack rating tool", allSnacks:"All snacks", myRatings:"My ratings", search:"Search brand or product...", addRating:"Rate", close:"✕ Close", save:"Save ✓", saved:"Saved!", savedSub:"Your rating has been added.", back:"← Back", reviews:"Reviews", rateFirst:"Rate your first snack →", noRatings:"No snacks rated yet", noRatingsSub:"Add the first one with the + button", noMyRatings:"No ratings yet from", welcomed:"Welcome to SnackCheck", welcomeSub:"What should we call you?", yourName:"Your name", namePh:"e.g. Shou", start:"Get started →", brand:"Brand", brandPh:"e.g. Lays, Haribo", product:"Product name", productPh:"e.g. Ovenbaked, Classic", flavor:"Flavor / Variant", flavorPh:"e.g. Paprika, Sea Salt", category:"Category", rating:"Rating", pros:"Pros", prosPh:"e.g. Crunchy, Well salted", cons:"Cons", consPh:"e.g. Too greasy, Bland", photo:"Photo", photoOptional:"(optional)", photoTap:"Tap to add a photo", minScore:"Min. score", onlyMulti:"Only 2+ ratings", reset:"✕ Reset", comma:"(comma separated)", required:"*", scoreLabels:["","😕 Bad","😐 Mediocre","🙂 OK","😋 Good","🤩 Amazing!"], rated:"Rated", avgScore:"Avg. score", categories:"Categories", ratingsCount:(n)=>`${n} rating${n!==1?"s":""}`, products:(n)=>`${n} product${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} rating${n!==1?"s":""} by ${name}`, you:" (you)", sorts:["Newest first","Oldest first","Highest score","Lowest score","Most rated","A → Z"], cats:["All","Chips","Biscuit","Nuts","Candy","Choco","Puffs","Other"] },
  fr: { appSub:"Outil de notation", allSnacks:"Tous les snacks", myRatings:"Mes notes", search:"Rechercher...", addRating:"Noter", close:"✕ Fermer", save:"Enregistrer ✓", saved:"Enregistré!", savedSub:"Votre note a été ajoutée.", back:"← Retour", reviews:"Avis", rateFirst:"Noter votre premier snack →", noRatings:"Aucun snack noté", noRatingsSub:"Ajoutez le premier via le bouton +", noMyRatings:"Aucune note de", welcomed:"Bienvenue sur SnackCheck", welcomeSub:"Comment vous appelle-t-on?", yourName:"Votre nom", namePh:"ex. Shou", start:"Commencer →", brand:"Marque", brandPh:"ex. Lays, Haribo", product:"Nom du produit", productPh:"ex. Ovenbaked, Classic", flavor:"Saveur / Variante", flavorPh:"ex. Paprika, Sel de mer", category:"Catégorie", rating:"Note", pros:"Points positifs", prosPh:"ex. Croustillant, Bien salé", cons:"Points négatifs", consPh:"ex. Trop gras, Sans goût", photo:"Photo", photoOptional:"(optionnel)", photoTap:"Appuyez pour ajouter une photo", minScore:"Score min.", onlyMulti:"Seulement 2+ notes", reset:"✕ Réinitialiser", comma:"(séparé par virgule)", required:"*", scoreLabels:["","😕 Mauvais","😐 Moyen","🙂 OK","😋 Bon","🤩 Excellent!"], rated:"Noté", avgScore:"Score moy.", categories:"Catégories", ratingsCount:(n)=>`${n} avis`, products:(n)=>`${n} produit${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} avis de ${name}`, you:" (moi)", sorts:["Plus récent","Plus ancien","Meilleur score","Score le plus bas","Plus noté","A → Z"], cats:["Tout","Chips","Biscuits","Noix","Bonbons","Choco","Puffs","Autre"] },
  es: { appSub:"Herramienta de valoración", allSnacks:"Todos los snacks", myRatings:"Mis valoraciones", search:"Buscar...", addRating:"Valorar", close:"✕ Cerrar", save:"Guardar ✓", saved:"¡Guardado!", savedSub:"Tu valoración ha sido añadida.", back:"← Volver", reviews:"Valoraciones", rateFirst:"Valorar tu primer snack →", noRatings:"Sin snacks valorados", noRatingsSub:"Añade el primero con el botón +", noMyRatings:"Sin valoraciones de", welcomed:"Bienvenido a SnackCheck", welcomeSub:"¿Cómo te llamamos?", yourName:"Tu nombre", namePh:"ej. Shou", start:"Empezar →", brand:"Marca", brandPh:"ej. Lays, Haribo", product:"Nombre del producto", productPh:"ej. Ovenbaked, Classic", flavor:"Sabor / Variante", flavorPh:"ej. Pimentón, Sal marina", category:"Categoría", rating:"Valoración", pros:"Puntos positivos", prosPh:"ej. Crujiente, Bien salado", cons:"Puntos negativos", consPh:"ej. Muy grasiento, Soso", photo:"Foto", photoOptional:"(opcional)", photoTap:"Toca para añadir una foto", minScore:"Puntuación mín.", onlyMulti:"Solo 2+ valoraciones", reset:"✕ Reiniciar", comma:"(separado por comas)", required:"*", scoreLabels:["","😕 Malo","😐 Regular","🙂 OK","😋 Bueno","🤩 ¡Genial!"], rated:"Valorado", avgScore:"Punt. media", categories:"Categorías", ratingsCount:(n)=>`${n} valoración${n!==1?"es":""}`, products:(n)=>`${n} producto${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} valoración${n!==1?"es":""} de ${name}`, you:" (yo)", sorts:["Más reciente","Más antiguo","Mayor puntuación","Menor puntuación","Más valorado","A → Z"], cats:["Todo","Chips","Galletas","Frutos secos","Dulces","Choco","Puffs","Otros"] },
  de: { appSub:"Snack-Bewertungstool", allSnacks:"Alle Snacks", myRatings:"Meine Bewertungen", search:"Suchen...", addRating:"Bewerten", close:"✕ Schließen", save:"Speichern ✓", saved:"Gespeichert!", savedSub:"Deine Bewertung wurde hinzugefügt.", back:"← Zurück", reviews:"Bewertungen", rateFirst:"Ersten Snack bewerten →", noRatings:"Noch keine Snacks bewertet", noRatingsSub:"Füge den ersten über den + Knopf hinzu", noMyRatings:"Noch keine Bewertungen von", welcomed:"Willkommen bei SnackCheck", welcomeSub:"Wie sollen wir dich nennen?", yourName:"Dein Name", namePh:"z.B. Shou", start:"Loslegen →", brand:"Marke", brandPh:"z.B. Lays, Haribo", product:"Produktname", productPh:"z.B. Ovenbaked, Classic", flavor:"Geschmack / Variante", flavorPh:"z.B. Paprika, Meersalz", category:"Kategorie", rating:"Bewertung", pros:"Vorteile", prosPh:"z.B. Knusprig, Gut gesalzen", cons:"Nachteile", consPh:"z.B. Zu fettig, Geschmacklos", photo:"Foto", photoOptional:"(optional)", photoTap:"Tippen um ein Foto hinzuzufügen", minScore:"Mindest-Score", onlyMulti:"Nur 2+ Bewertungen", reset:"✕ Zurücksetzen", comma:"(kommagetrennt)", required:"*", scoreLabels:["","😕 Schlecht","😐 Mäßig","🙂 OK","😋 Gut","🤩 Großartig!"], rated:"Bewertet", avgScore:"Ø Score", categories:"Kategorien", ratingsCount:(n)=>`${n} Bewertung${n!==1?"en":""}`, products:(n)=>`${n} Produkt${n!==1?"e":""}`, myRatingsCount:(n,name)=>`${n} Bewertung${n!==1?"en":""} von ${name}`, you:" (ich)", sorts:["Neueste zuerst","Älteste zuerst","Höchste Bewertung","Niedrigste Bewertung","Meistbewertet","A → Z"], cats:["Alles","Chips","Kekse","Nüsse","Süßigkeiten","Schokolade","Puffs","Sonstiges"] },
  it: { appSub:"Strumento di valutazione", allSnacks:"Tutti gli snack", myRatings:"Le mie valutazioni", search:"Cerca...", addRating:"Valuta", close:"✕ Chiudi", save:"Salva ✓", saved:"Salvato!", savedSub:"La tua valutazione è stata aggiunta.", back:"← Indietro", reviews:"Valutazioni", rateFirst:"Valuta il tuo primo snack →", noRatings:"Nessuno snack valutato", noRatingsSub:"Aggiungi il primo con il pulsante +", noMyRatings:"Nessuna valutazione di", welcomed:"Benvenuto su SnackCheck", welcomeSub:"Come ti chiamiamo?", yourName:"Il tuo nome", namePh:"es. Shou", start:"Inizia →", brand:"Marca", brandPh:"es. Lays, Haribo", product:"Nome prodotto", productPh:"es. Ovenbaked, Classic", flavor:"Gusto / Variante", flavorPh:"es. Paprika, Sale marino", category:"Categoria", rating:"Valutazione", pros:"Punti positivi", prosPh:"es. Croccante, Ben salato", cons:"Punti negativi", consPh:"es. Troppo unto, Insipido", photo:"Foto", photoOptional:"(opzionale)", photoTap:"Tocca per aggiungere una foto", minScore:"Punteggio min.", onlyMulti:"Solo 2+ valutazioni", reset:"✕ Reimposta", comma:"(separato da virgole)", required:"*", scoreLabels:["","😕 Pessimo","😐 Mediocre","🙂 OK","😋 Buono","🤩 Eccellente!"], rated:"Valutato", avgScore:"Punteggio medio", categories:"Categorie", ratingsCount:(n)=>`${n} valutazion${n!==1?"i":"e"}`, products:(n)=>`${n} prodott${n!==1?"i":"o"}`, myRatingsCount:(n,name)=>`${n} valutazion${n!==1?"i":"e"} di ${name}`, you:" (io)", sorts:["Più recente","Più vecchio","Punteggio più alto","Punteggio più basso","Più valutato","A → Z"], cats:["Tutto","Chips","Biscotti","Noci","Dolci","Cioccolato","Puffs","Altro"] },
};
const LANG_FLAGS = { nl:"🇳🇱", en:"🇬🇧", fr:"🇫🇷", es:"🇪🇸", de:"🇩🇪", it:"🇮🇹" };
const CAT_ICONS = ["🛒","🥔","🍪","🥜","🍬","🍫","🍿","📦"];
const CAT_IDS   = ["all","chips","koek","noten","snoep","chocolade","popcorn","anders"];
const SORTS_IDS = ["recent","oldest","score_desc","score_asc","most_rated","az"];
const toCode = (b,n,f) => { const c=s=>s.trim().replace(/\s+/g,"").replace(/[^a-zA-Z0-9]/g,""); return [c(b),c(n),c(f)].filter(Boolean).join("_"); };
const P = {
  orange:"#F5A623", orangeLight:"#FFF8E8", orangeDark:"#C47D00",
  bg:"#FAFAFA", card:"#FFFFFF", text:"#111111", muted:"#888888", border:"#F0EEEA",
  green:"#22C55E", greenLight:"#EDFFF4", red:"#EF4444", redLight:"#FFF0F0",
  yellow:"#FFB800", yellowLight:"#FFF8E0",
};
const scoreColor = s => s>=4?P.green:s===3?P.yellow:P.red;
const timeAgo = ts => { const d=Date.now()-ts,m=Math.floor(d/6e4); return m<60?`${m}m`:m<1440?`${Math.floor(m/60)}u`:`${Math.floor(m/1440)}d`; };
const initials = name => (name||"?").split(/[\s_]+/).map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
const avatarColor = name => { const cols=[P.orange,"#6C3FD4","#0AADA6","#E8336B","#3B82F6"]; let h=0; for(const c of (name||"?")) h=(h*31+c.charCodeAt(0))%cols.length; return cols[h]; };

async function fetchProductInfo(brand, name, flavor) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:600,
        messages:[{ role:"user", content:`You are a snack food database. For: Brand="${brand}", Product="${name}", Flavor="${flavor}", return ONLY a JSON object, no markdown:
{"description":"2 sentence description","per100g":{"calories":0,"protein":0,"fat":0,"carbs":0,"sugar":0,"salt":0,"fibre":0},"servingSize":0,"ingredients":"comma-separated ingredients","confidence":"high|medium|low"}
If unknown, estimate and set confidence to "low". Return only JSON.` }]
      })
    });
    const d = await res.json();
    return JSON.parse((d.content?.find(b=>b.type==="text")?.text||"{}").replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Stars({value, onChange, size=28}) {
  const [hov,setHov]=useState(0);
  return (
    <div style={{display:"flex",gap:3}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} onClick={()=>onChange&&onChange(i)}
          onMouseEnter={()=>onChange&&setHov(i)} onMouseLeave={()=>onChange&&setHov(0)}
          style={{fontSize:size,cursor:onChange?"pointer":"default",transition:"transform .12s",
            transform:(hov||value)>=i?"scale(1.2)":"scale(1)",color:(hov||value)>=i?"#FFB800":"#E0DDD8"}}>★</span>
      ))}
    </div>
  );
}
function ScorePill({score, size="sm"}) {
  const col=scoreColor(score), bg=score>=4?P.greenLight:score===3?P.yellowLight:P.redLight;
  return (
    <span style={{background:bg,color:col,fontWeight:700,fontSize:size==="lg"?20:13,borderRadius:20,
      padding:size==="lg"?"4px 14px":"2px 8px",display:"inline-flex",alignItems:"center",gap:3}}>
      <span style={{fontSize:size==="lg"?16:11}}>★</span>
      {typeof score==="number"?score.toFixed(1):score}
    </span>
  );
}
function Avatar({name, size=32}) {
  const n=name||"?";
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:avatarColor(n),display:"flex",
      alignItems:"center",justifyContent:"center",fontSize:size*0.35,color:"white",fontWeight:700,flexShrink:0}}>
      {initials(n)}
    </div>
  );
}
function ProductInfoCard({info}) {
  const [infoTab, setInfoTab] = useState("nutrition");
  if(!info) return null;
  const ingList = info.ingredients ? info.ingredients.split(",") : [];
  return (
    <div style={{background:"#111",borderRadius:12,padding:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,color:P.orange,letterSpacing:1,textTransform:"uppercase"}}>AI Product Info</span>
        <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"#222",
          color:info.confidence==="high"?"#22C55E":info.confidence==="medium"?"#FFB800":"#EF4444"}}>
          {info.confidence} confidence
        </span>
      </div>
      {info.description && (
        <p style={{fontSize:13,color:"#ccc",margin:"0 0 12px",lineHeight:1.5}}>{info.description}</p>
      )}
      <div style={{display:"flex",background:"#1a1a1a",borderRadius:8,padding:3,marginBottom:12,gap:3}}>
        {["nutrition","ingredients"].map(tb=>(
          <button key={tb} onClick={()=>setInfoTab(tb)}
            style={{flex:1,padding:"6px",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600,
              background:infoTab===tb?P.orange:"transparent",
              color:infoTab===tb?"white":"#666",transition:"all .15s"}}>
            {tb==="nutrition"?"Nutrition":"Ingredients"}
          </button>
        ))}
      </div>
      {infoTab==="nutrition" && info.per100g && (
        <div>
          <div style={{fontSize:11,color:"#666",marginBottom:6}}>
            PER 100g{info.servingSize?` · serving ~${info.servingSize}g`:""}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[
              {label:"Calories",val:`${info.per100g.calories} kcal`},
              {label:"Protein",val:`${info.per100g.protein}g`},
              {label:"Fat",val:`${info.per100g.fat}g`},
              {label:"Carbs",val:`${info.per100g.carbs}g`},
              {label:"Sugar",val:`${info.per100g.sugar}g`},
              {label:"Salt",val:`${info.per100g.salt}g`},
              {label:"Fibre",val:`${info.per100g.fibre??"—"}${info.per100g.fibre!=null?"g":""}`},
            ].map((n,i)=>(
              <div key={i} style={{background:"#1a1a1a",borderRadius:8,padding:"7px 8px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"white"}}>{n.val}</div>
                <div style={{fontSize:10,color:"#666",marginTop:2}}>{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {infoTab==="ingredients" && (
        <div style={{fontSize:13,color:"#bbb",lineHeight:1.9}}>
          {ingList.length > 0
            ? ingList.map((ing,i)=>(
                <span key={i}>
                  <span style={{color:"white",fontWeight:500}}>{ing.trim()}</span>
                  {i < ingList.length-1 && <span style={{color:"#444"}}>, </span>}
                </span>
              ))
            : <span style={{color:"#555",fontStyle:"italic"}}>No ingredients data available.</span>
          }
        </div>
      )}
      <div style={{fontSize:10,color:"#444",marginTop:10}}>* AI-estimated. May not reflect exact packaging values.</div>
    </div>
  );
}

const inp = {width:"100%",border:`1.5px solid ${P.border}`,borderRadius:10,padding:"11px 14px",fontSize:15,outline:"none",boxSizing:"border-box",background:"#FAFAFA",fontFamily:"system-ui,sans-serif",color:P.text,transition:"border .15s",display:"block"};
const lbl = {fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:P.muted,display:"block",marginBottom:6,fontFamily:"system-ui,sans-serif"};

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, t }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const canSubmit = mode==='signup' ? (name.trim()&&email&&password.length>=6) : (email&&password);

  const submit = async () => {
    if(!canSubmit||busy) return;
    setBusy(true); setError('');
    if(mode==='signup') {
      const {error:err}=await supabase.auth.signUp({email,password,options:{data:{display_name:name.trim()}}});
      if(err){setError(err.message);setBusy(false);}else onClose();
    } else {
      const {error:err}=await supabase.auth.signInWithPassword({email,password});
      if(err){setError(err.message);setBusy(false);}else onClose();
    }
  };

  return (
    <div style={{background:P.card,borderRadius:20,padding:28,maxWidth:340,width:"100%",margin:"0 auto",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
      <div style={{width:56,height:56,borderRadius:16,background:P.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16}}>🍬</div>
      <div style={{display:"flex",background:"#F5F5F5",borderRadius:12,padding:3,marginBottom:20,gap:3}}>
        {[['login','Log in'],['signup','Sign up']].map(([m,label])=>(
          <button key={m} onClick={()=>{setMode(m);setError('');}}
            style={{flex:1,padding:"8px",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,
              background:mode===m?P.orange:"transparent",color:mode===m?"white":"#888",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>
      {mode==='signup'&&(
        <>
          <label style={lbl}>{t.yourName} *</label>
          <input style={{...inp,marginBottom:12}} placeholder={t.namePh} value={name}
            onChange={e=>setName(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </>
      )}
      <label style={lbl}>Email *</label>
      <input style={{...inp,marginBottom:12}} type="email" placeholder="your@email.com" value={email}
        onChange={e=>setEmail(e.target.value)} autoFocus={mode==='login'} onKeyDown={e=>e.key==='Enter'&&submit()}/>
      <label style={lbl}>Password * {mode==='signup'&&<span style={{textTransform:"none",fontWeight:400,letterSpacing:0,fontSize:10}}>(min. 6 characters)</span>}</label>
      <input style={{...inp,marginBottom:error?8:20}} type="password" placeholder="••••••••" value={password}
        onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
      {error&&<div style={{fontSize:13,color:P.red,marginBottom:14,padding:"8px 12px",background:P.redLight,borderRadius:8}}>{error}</div>}
      <button onClick={submit} disabled={busy||!canSubmit}
        style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
          background:(busy||!canSubmit)?P.muted:P.orange,color:"white",fontWeight:700,fontSize:15,
          cursor:(busy||!canSubmit)?"not-allowed":"pointer",transition:"background .15s"}}>
        {busy?'...':(mode==='login'?'Log in →':'Create account →')}
      </button>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function SnackCheck() {
  const [lang,setLang]=useState("nl");
  const [showLangPicker,setShowLangPicker]=useState(false);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("home");
  const [tab,setTab]=useState("all");
  const [ratings,setRatings]=useState([]);
  const [cat,setCat]=useState("all");
  const [search,setSearch]=useState("");
  const [selProd,setSelProd]=useState(null);
  const [sortBy,setSortBy]=useState("recent");
  const [showFilter,setShowFilter]=useState(false);
  const [minScore,setMinScore]=useState(0);
  const [onlyMulti,setOnlyMulti]=useState(false);
  const [filterBrand,setFilterBrand]=useState("");
  const [filterFlavor,setFilterFlavor]=useState("");
  const [maxCalories,setMaxCalories]=useState(0);
  const [minProtein,setMinProtein]=useState(0);
  const [minFibre,setMinFibre]=useState(0);
  const [form,setForm]=useState({brand:"",name:"",flavor:"",category:"chips",score:0,pros:"",cons:"",image:null});
  const [productInfo,setProductInfo]=useState(null);
  const [infoLoading,setInfoLoading]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [showAuthModal,setShowAuthModal]=useState(false);
  const infoDebRef=useRef();
  const t = LANGS[lang];
  const userName = user?.user_metadata?.display_name;

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user??null));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>setUser(session?.user??null));
    (async()=>{
      const {data,error}=await supabase.from('ratings').select('*').order('timestamp',{ascending:false});
      if(!error&&data) setRatings(data.map(mapRow));
      const l=localStorage.getItem(LANG_KEY);
      if(l&&LANGS[l]) setLang(l);
      setLoading(false);
    })();
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(view!=="rate") return;
    clearTimeout(infoDebRef.current);
    if(!form.brand||!form.name||!form.flavor){setProductInfo(null);return;}
    infoDebRef.current=setTimeout(async()=>{
      setInfoLoading(true);
      const info=await fetchProductInfo(form.brand,form.name,form.flavor);
      setProductInfo(info);
      setInfoLoading(false);
    },900);
  },[form.brand,form.name,form.flavor,view]);

  const handleLang = l=>{setLang(l);setShowLangPicker(false);localStorage.setItem(LANG_KEY,l);};
  const goToRate = ()=>{if(!user){setShowAuthModal(true);}else{setView("rate");}};
  const avg = list=>list.reduce((s,r)=>s+r.score,0)/list.length;

  const filtered = ratings.filter(r=>
    (cat==="all"||r.category===cat)&&
    (!search||r.brand.toLowerCase().includes(search.toLowerCase())||r.productCode.toLowerCase().includes(search.toLowerCase())||r.name.toLowerCase().includes(search.toLowerCase()))&&
    (!filterBrand||r.brand.toLowerCase().includes(filterBrand.toLowerCase()))&&
    (!filterFlavor||r.flavor.toLowerCase().includes(filterFlavor.toLowerCase()))
  );
  const grouped = filtered.reduce((a,r)=>{(a[r.productCode]=a[r.productCode]||[]).push(r);return a;},{});
  const productNutrient = (list,key)=>{const r=list.find(r=>r.productInfo?.per100g?.[key]!=null);return r?.productInfo?.per100g?.[key];};
  let codes = Object.keys(grouped)
    .filter(c=>avg(grouped[c])>=minScore)
    .filter(c=>!onlyMulti||grouped[c].length>1)
    .filter(c=>{if(maxCalories===0)return true;const v=productNutrient(grouped[c],"calories");return v!=null&&v<=maxCalories;})
    .filter(c=>{if(minProtein===0)return true;const v=productNutrient(grouped[c],"protein");return v!=null&&v>=minProtein;})
    .filter(c=>{if(minFibre===0)return true;const v=productNutrient(grouped[c],"fibre");return v!=null&&v>=minFibre;});
  codes.sort((a,b)=>{
    const la=grouped[a],lb=grouped[b];
    switch(sortBy){
      case"recent":     return Math.max(...lb.map(r=>r.timestamp))-Math.max(...la.map(r=>r.timestamp));
      case"oldest":     return Math.min(...la.map(r=>r.timestamp))-Math.min(...lb.map(r=>r.timestamp));
      case"score_desc": return avg(lb)-avg(la);
      case"score_asc":  return avg(la)-avg(lb);
      case"most_rated": return lb.length-la.length;
      case"az":         return la[0].brand.localeCompare(lb[0].brand);
      default: return 0;
    }
  });

  const myRatings = ratings
    .filter(r=>r.userId===user?.id)
    .filter(r=>(cat==="all"||r.category===cat)&&(!search||r.brand.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b)=>sortBy==="score_desc"?b.score-a.score:sortBy==="score_asc"?a.score-b.score:sortBy==="az"?a.brand.localeCompare(b.brand):sortBy==="oldest"?a.timestamp-b.timestamp:b.timestamp-a.timestamp);

  const filterCount=(minScore>0?1:0)+(onlyMulti?1:0)+(filterBrand?1:0)+(filterFlavor?1:0)+(maxCalories>0?1:0)+(minProtein>0?1:0)+(minFibre>0?1:0);

  const handleDelete = async id=>{
    const {error}=await supabase.from('ratings').delete().eq('id',id);
    if(error){console.error(error);return;}
    const upd=ratings.filter(r=>r.id!==id);
    setRatings(upd);
    if(upd.filter(r=>r.productCode===selProd).length===0) setView("home");
  };

  const handleSubmit = async ()=>{
    if(!form.brand||!form.name||!form.flavor||!form.category||!form.score) return;
    const prodCode=toCode(form.brand,form.name,form.flavor);
    const r={id:Date.now(),userId:user.id,productCode:prodCode,brand:form.brand,name:form.name,
      flavor:form.flavor,category:form.category,score:form.score,
      pros:form.pros.split(",").map(s=>s.trim()).filter(Boolean),
      cons:form.cons.split(",").map(s=>s.trim()).filter(Boolean),
      image:form.image||null,productInfo:productInfo||null,timestamp:Date.now(),rater:userName};
    const {error}=await supabase.from('ratings').insert([mapToRow(r)]);
    if(error){console.error(error);return;}
    setRatings(prev=>[...prev,r]);
    setSubmitted(true);
    setTimeout(()=>{setSubmitted(false);setView("home");setForm({brand:"",name:"",flavor:"",category:"chips",score:0,pros:"",cons:"",image:null});setProductInfo(null);},2000);
  };

  const authModal = showAuthModal&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>e.target===e.currentTarget&&setShowAuthModal(false)}>
      <AuthModal onClose={()=>setShowAuthModal(false)} t={t}/>
    </div>
  );

  function Header({subtitle,action}) {
    return (
      <div style={{background:P.orange,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍬</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:"white",letterSpacing:-0.5,lineHeight:1}}>SnacksCheck</div>
            {subtitle&&<div style={{fontSize:10,color:"rgba(255,255,255,0.7)",letterSpacing:1.5,textTransform:"uppercase",marginTop:1}}>{subtitle}</div>}
          </div>
        </div>
        {action||<div style={{display:"flex",alignItems:"center",gap:8}}>
          {user
            ? <><Avatar name={userName} size={30}/>
                <button onClick={()=>supabase.auth.signOut()}
                  style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                  Log out
                </button>
              </>
            : <button onClick={()=>setShowAuthModal(true)}
                style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                Log in
              </button>
          }
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowLangPicker(p=>!p)}
              style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:16}}>
              {LANG_FLAGS[lang]}
            </button>
            {showLangPicker&&(
              <div style={{position:"absolute",right:0,top:36,background:P.card,borderRadius:12,border:`1.5px solid ${P.border}`,overflow:"hidden",zIndex:200,minWidth:140,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
                {Object.keys(LANGS).map(l=>(
                  <button key={l} onClick={()=>handleLang(l)}
                    style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",background:lang===l?P.orangeLight:"white",cursor:"pointer",fontSize:13,fontWeight:lang===l?700:400,color:lang===l?P.orange:P.text,borderBottom:`1px solid ${P.border}`}}>
                    <span style={{fontSize:16}}>{LANG_FLAGS[l]}</span>
                    {{nl:"Nederlands",en:"English",fr:"Français",es:"Español",de:"Deutsch",it:"Italiano"}[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>}
      </div>
    );
  }

  if(loading) return <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",color:P.muted,fontSize:14}}>Laden...</div>;

  if(submitted) return (
    <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:P.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>✅</div>
      <div style={{fontSize:22,fontWeight:700,color:P.text}}>{t.saved}</div>
      <div style={{color:P.muted,fontSize:14}}>{t.savedSub}</div>
    </div>
  );

  // ── Rate view ─────────────────────────────────────────────────────────────
  if(view==="rate") return (
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
      <Header subtitle={t.addRating} action={
        <button onClick={()=>setView("home")} style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:20,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>{t.close}</button>
      }/>
      {authModal}
      <div style={{padding:20,maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:P.orangeLight,borderRadius:12,padding:"10px 14px",marginBottom:24,marginTop:12}}>
          <Avatar name={userName} size={32}/>
          <div style={{fontSize:13,fontWeight:700,color:P.text}}>{userName}</div>
        </div>
        <label style={lbl}>{t.brand} {t.required}</label>
        <input style={{...inp,marginBottom:16}} placeholder={t.brandPh} value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/>
        <label style={lbl}>{t.product} {t.required}</label>
        <input style={{...inp,marginBottom:16}} placeholder={t.productPh} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <label style={lbl}>{t.flavor} {t.required}</label>
        <input style={{...inp,marginBottom:16}} placeholder={t.flavorPh} value={form.flavor} onChange={e=>setForm({...form,flavor:e.target.value})}/>
        {(infoLoading||(productInfo&&form.brand&&form.name&&form.flavor))&&(
          <div style={{marginBottom:16}}>
            {infoLoading
              ? <div style={{background:"#111",borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:8,color:"#888",fontSize:13}}>
                  <div style={{width:16,height:16,border:"2px solid #444",borderTopColor:P.orange,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Looking up product info...
                </div>
              : <ProductInfoCard info={productInfo}/>
            }
          </div>
        )}
        <label style={lbl}>{t.category} {t.required}</label>
        <select style={{...inp,marginBottom:16,cursor:"pointer"}} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          {CAT_IDS.filter(c=>c!=="all").map((c,i)=><option key={c} value={c}>{CAT_ICONS[i+1]} {t.cats[i+1]}</option>)}
        </select>
        <label style={lbl}>{t.rating} {t.required}</label>
        <div style={{marginBottom:6}}><Stars value={form.score} onChange={v=>setForm({...form,score:v})} size={44}/></div>
        {form.score>0&&<div style={{fontSize:14,color:scoreColor(form.score),fontWeight:600,marginBottom:16}}>{t.scoreLabels[form.score]}</div>}
        <label style={lbl}>{t.pros} <span style={{textTransform:"none",fontWeight:400,letterSpacing:0}}>{t.comma}</span></label>
        <input style={{...inp,marginBottom:16}} placeholder={t.prosPh} value={form.pros} onChange={e=>setForm({...form,pros:e.target.value})}/>
        <label style={lbl}>{t.cons} <span style={{textTransform:"none",fontWeight:400,letterSpacing:0}}>{t.comma}</span></label>
        <input style={{...inp,marginBottom:16}} placeholder={t.consPh} value={form.cons} onChange={e=>setForm({...form,cons:e.target.value})}/>
        <label style={lbl}>{t.photo} <span style={{textTransform:"none",fontWeight:400,letterSpacing:0}}>{t.photoOptional}</span></label>
        {form.image
          ? <div style={{position:"relative",marginBottom:24}}>
              <img src={form.image} alt="snack" style={{width:"100%",borderRadius:12,maxHeight:200,objectFit:"cover",border:`1.5px solid ${P.border}`}}/>
              <button onClick={()=>setForm({...form,image:null})} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.55)",color:"white",border:"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          : <label style={{display:"block",marginBottom:24,cursor:"pointer"}}>
              <div style={{border:`1.5px dashed ${P.border}`,borderRadius:12,padding:"20px",textAlign:"center",background:P.bg}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=P.orange}
                onMouseLeave={e=>e.currentTarget.style.borderColor=P.border}>
                <div style={{fontSize:28,marginBottom:6}}>📷</div>
                <div style={{fontSize:13,color:P.muted}}>{t.photoTap}</div>
              </div>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                const file=e.target.files[0]; if(!file) return;
                const reader=new FileReader();
                reader.onload=ev=>setForm(f=>({...f,image:ev.target.result}));
                reader.readAsDataURL(file);
              }}/>
            </label>
        }
        <button onClick={handleSubmit} disabled={!form.brand||!form.name||!form.flavor||!form.category||!form.score}
          style={{width:"100%",background:(!form.brand||!form.name||!form.flavor||!form.category||!form.score)?P.muted:P.orange,
            color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:16,fontWeight:800,
            cursor:(!form.brand||!form.name||!form.flavor||!form.category||!form.score)?"not-allowed":"pointer",transition:"background .15s"}}>
          {t.save}
        </button>
      </div>
    </div>
  );

  // ── Detail view ───────────────────────────────────────────────────────────
  if(view==="detail"&&selProd) {
    const pRatings=ratings.filter(r=>r.productCode===selProd);
    if(pRatings.length===0){setView("home");return null;}
    const first=pRatings[0];
    const a=avg(pRatings);
    const catIdx=CAT_IDS.indexOf(first.category);
    const detailInfo=pRatings.find(r=>r.productInfo)?.productInfo||null;
    return (
      <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
        <Header subtitle={first.brand}/>
        {authModal}
        <div style={{padding:20,maxWidth:520,margin:"0 auto"}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:14,fontWeight:700,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>{t.back}</button>
          <div style={{background:P.card,borderRadius:16,border:`1.5px solid ${P.border}`,padding:20,marginBottom:20}}>
            <span style={{background:P.orangeLight,color:P.orangeDark,fontSize:11,fontWeight:700,borderRadius:20,padding:"2px 8px"}}>{CAT_ICONS[catIdx]} {t.cats[catIdx]}</span>
            <h1 style={{fontSize:24,fontWeight:800,margin:"10px 0 4px",color:P.text,lineHeight:1.1}}>{first.brand} {first.name}</h1>
            {first.flavor&&<div style={{color:P.muted,fontSize:14,marginBottom:14}}>{first.flavor}</div>}
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <ScorePill score={parseFloat(a.toFixed(1))} size="lg"/>
              <Stars value={Math.round(a)} size={22}/>
              <span style={{color:P.muted,fontSize:13}}>{t.ratingsCount(pRatings.length)}</span>
            </div>
          </div>
          {detailInfo&&<div style={{marginBottom:20}}><ProductInfoCard info={detailInfo}/></div>}
          <button onClick={()=>{
            if(!user){setShowAuthModal(true);return;}
            setForm({brand:first.brand,name:first.name,flavor:first.flavor,category:first.category,score:0,pros:"",cons:"",image:null});
            setView("rate");
          }} style={{width:"100%",background:P.orange,color:"white",border:"none",borderRadius:12,padding:"12px",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:20}}>
            + {t.addRating}
          </button>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:P.muted,marginBottom:12}}>{t.reviews}</div>
          {pRatings.map(r=>{
            const isMe=r.userId===user?.id;
            return (
              <div key={r.id} style={{background:P.card,borderRadius:14,border:`1.5px solid ${isMe?P.orange:P.border}`,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Avatar name={r.rater} size={28}/>
                    <span style={{fontSize:13,fontWeight:700,color:isMe?P.orange:P.text}}>{r.rater}{isMe?t.you:""}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <ScorePill score={r.score}/>
                    <span style={{fontSize:11,color:P.muted}}>{timeAgo(r.timestamp)}</span>
                    {isMe&&<button onClick={()=>handleDelete(r.id)} style={{background:P.redLight,color:P.red,border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>}
                  </div>
                </div>
                {r.image&&<img src={r.image} alt="snack" style={{width:"100%",borderRadius:10,maxHeight:180,objectFit:"cover",marginBottom:8}}/>}
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {r.pros?.map((p,i)=><span key={i} style={{background:P.greenLight,color:P.green,borderRadius:8,padding:"3px 9px",fontSize:12,fontWeight:600}}>✓ {p}</span>)}
                  {r.cons?.map((c2,i)=><span key={i} style={{background:P.redLight,color:P.red,borderRadius:8,padding:"3px 9px",fontSize:12,fontWeight:600}}>✗ {c2}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Home ──────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
      <Header/>
      {authModal}
      <div style={{display:"flex",background:P.card,borderBottom:`1.5px solid ${P.border}`}}>
        {[{id:"all",icon:"🌍",label:t.allSnacks},{id:"mine",icon:"👤",label:t.myRatings}].map(tb=>(
          <button key={tb.id} onClick={()=>{if(tb.id==="mine"&&!user){setShowAuthModal(true);}else{setTab(tb.id);}}}
            style={{flex:1,padding:"12px 0",border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:tab===tb.id?700:400,color:tab===tb.id?P.orange:P.muted,borderBottom:tab===tb.id?`2.5px solid ${P.orange}`:"2.5px solid transparent",transition:"all .15s",position:"relative"}}>
            {tb.icon} {tb.label}
            {tb.id==="mine"&&tab!=="mine"&&user&&ratings.filter(r=>r.userId===user?.id).length>0&&(
              <span style={{position:"absolute",top:8,right:"calc(50% - 52px)",background:P.orange,color:"white",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px"}}>{ratings.filter(r=>r.userId===user?.id).length}</span>
            )}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"10px 14px",background:P.card,borderBottom:`1.5px solid ${P.border}`}}>
        {CAT_IDS.map((c,i)=>(
          <button key={c} onClick={()=>setCat(c)}
            style={{background:cat===c?P.orange:P.bg,color:cat===c?"white":P.muted,border:`1.5px solid ${cat===c?P.orange:P.border}`,borderRadius:20,padding:"5px 13px",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",fontWeight:cat===c?700:400,transition:"all .15s"}}>
            {CAT_ICONS[i]} {t.cats[i]}
          </button>
        ))}
      </div>
      <div style={{padding:"10px 14px",background:P.card,borderBottom:`1.5px solid ${P.border}`,display:"flex",gap:8,alignItems:"center"}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:P.muted}}>🔍</span>
          <input style={{...inp,paddingLeft:34}} placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{border:`1.5px solid ${P.border}`,borderRadius:10,padding:"9px 10px",fontSize:13,outline:"none",background:P.bg,cursor:"pointer",color:P.text}}>
          {SORTS_IDS.map((id,i)=><option key={id} value={id}>{t.sorts[i]}</option>)}
        </select>
        {tab==="all"&&(
          <button onClick={()=>setShowFilter(p=>!p)}
            style={{border:`1.5px solid ${filterCount>0?P.orange:P.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,background:filterCount>0?P.orangeLight:P.bg,cursor:"pointer",color:filterCount>0?P.orange:P.muted,fontWeight:600,whiteSpace:"nowrap"}}>
            ⚙{filterCount>0?` (${filterCount})`:""}
          </button>
        )}
      </div>
      {showFilter&&tab==="all"&&(
        <div style={{background:P.card,borderBottom:`1.5px solid ${P.border}`,padding:"14px 18px",display:"flex",flexWrap:"wrap",gap:16}}>
          <div style={{width:"100%",display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{...lbl,marginBottom:6}}>Max kcal/100g</div>
              <select value={maxCalories} onChange={e=>setMaxCalories(parseInt(e.target.value))}
                style={{width:"100%",border:`1.5px solid ${maxCalories>0?P.orange:P.border}`,borderRadius:10,padding:"7px 10px",fontSize:13,outline:"none",background:maxCalories>0?P.orangeLight:P.bg,cursor:"pointer",color:maxCalories>0?P.orange:P.text,fontWeight:maxCalories>0?700:400}}>
                <option value={0}>Any</option><option value={300}>≤ 300</option><option value={400}>≤ 400</option><option value={500}>≤ 500</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <div style={{...lbl,marginBottom:6}}>Min protein/100g</div>
              <select value={minProtein} onChange={e=>setMinProtein(parseInt(e.target.value))}
                style={{width:"100%",border:`1.5px solid ${minProtein>0?P.orange:P.border}`,borderRadius:10,padding:"7px 10px",fontSize:13,outline:"none",background:minProtein>0?P.orangeLight:P.bg,cursor:"pointer",color:minProtein>0?P.orange:P.text,fontWeight:minProtein>0?700:400}}>
                <option value={0}>Any</option><option value={5}>≥ 5g</option><option value={10}>≥ 10g</option><option value={15}>≥ 15g</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <div style={{...lbl,marginBottom:6}}>Min fibre/100g</div>
              <select value={minFibre} onChange={e=>setMinFibre(parseInt(e.target.value))}
                style={{width:"100%",border:`1.5px solid ${minFibre>0?P.orange:P.border}`,borderRadius:10,padding:"7px 10px",fontSize:13,outline:"none",background:minFibre>0?P.orangeLight:P.bg,cursor:"pointer",color:minFibre>0?P.orange:P.text,fontWeight:minFibre>0?700:400}}>
                <option value={0}>Any</option><option value={3}>≥ 3g</option><option value={5}>≥ 5g</option><option value={7}>≥ 7g</option>
              </select>
            </div>
          </div>
          <div style={{width:"100%",display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{...lbl,marginBottom:6}}>{t.brand}</div>
              <input style={{...inp,marginBottom:0,fontSize:13,padding:"7px 10px"}} placeholder={t.brandPh} value={filterBrand} onChange={e=>setFilterBrand(e.target.value)}/>
            </div>
            <div style={{flex:1}}>
              <div style={{...lbl,marginBottom:6}}>{t.flavor}</div>
              <input style={{...inp,marginBottom:0,fontSize:13,padding:"7px 10px"}} placeholder={t.flavorPh} value={filterFlavor} onChange={e=>setFilterFlavor(e.target.value)}/>
            </div>
          </div>
          <div>
            <div style={{...lbl,marginBottom:8}}>{t.minScore}</div>
            <div style={{display:"flex",gap:5}}>
              {[0,1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setMinScore(n)}
                  style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${minScore===n?P.orange:P.border}`,background:minScore===n?P.orange:P.bg,color:minScore===n?"white":P.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
                  {n===0?"★":n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{...lbl,marginBottom:8}}>{t.onlyMulti}</div>
            <button onClick={()=>setOnlyMulti(p=>!p)}
              style={{padding:"7px 12px",borderRadius:10,border:`1.5px solid ${onlyMulti?P.orange:P.border}`,background:onlyMulti?P.orangeLight:P.bg,color:onlyMulti?P.orange:P.muted,fontWeight:600,cursor:"pointer",fontSize:13}}>
              {onlyMulti?"✓":"○"} {t.onlyMulti}
            </button>
          </div>
          {filterCount>0&&(
            <div style={{display:"flex",alignItems:"flex-end"}}>
              <button onClick={()=>{setMinScore(0);setOnlyMulti(false);setFilterBrand("");setFilterFlavor("");setMaxCalories(0);setMinProtein(0);setMinFibre(0);}}
                style={{padding:"7px 12px",borderRadius:10,border:`1.5px solid ${P.border}`,background:P.bg,color:P.muted,cursor:"pointer",fontSize:13}}>
                {t.reset}
              </button>
            </div>
          )}
        </div>
      )}
      <div style={{padding:"6px 16px",fontSize:11,color:P.muted,background:P.bg,letterSpacing:.3}}>
        {tab==="all"
          ?`${t.products(codes.length)} · ${t.sorts[SORTS_IDS.indexOf(sortBy)]}`
          :t.myRatingsCount(myRatings.length,userName||"...")}
      </div>
      {tab==="all"&&(codes.length===0
        ? <div style={{textAlign:"center",padding:60,color:P.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>🍿</div>
            <div style={{fontWeight:600}}>{t.noRatings}</div>
            <div style={{fontSize:13,marginTop:6}}>{t.noRatingsSub}</div>
          </div>
        : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,padding:14}}>
            {codes.map(code=>{
              const list=grouped[code],first=list[0],a=avg(list),catIdx=CAT_IDS.indexOf(first.category);
              return (
                <div key={code} onClick={()=>{setSelProd(code);setView("detail");}}
                  style={{background:P.card,borderRadius:16,padding:14,border:`1.5px solid ${P.border}`,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=P.orange;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=P.border;}}>
                  <div style={{fontSize:26,marginBottom:8}}>{CAT_ICONS[catIdx]}</div>
                  <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,marginBottom:2,color:P.text}}>{first.brand}</div>
                  <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,marginBottom:2,color:P.text}}>{first.name}</div>
                  <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,marginBottom:6,color:P.text}}>{first.flavor}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                    <ScorePill score={parseFloat(a.toFixed(1))}/>
                    <span style={{fontSize:11,color:P.muted}}>{list.length}×</span>
                  </div>
                </div>
              );
            })}
          </div>
      )}
      {tab==="mine"&&(myRatings.length===0
        ? <div style={{textAlign:"center",padding:60,color:P.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>🍿</div>
            <div style={{fontWeight:600,color:P.text,marginBottom:16}}>{t.noMyRatings} <span style={{color:P.orange}}>{userName}</span></div>
            <button onClick={goToRate} style={{background:P.orange,color:"white",border:"none",borderRadius:12,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.rateFirst}</button>
          </div>
        : <div style={{padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[
                {label:t.rated,val:myRatings.length},
                {label:t.avgScore,val:avg(myRatings).toFixed(1)+" ★"},
                {label:t.categories,val:[...new Set(myRatings.map(r=>r.category))].length},
              ].map((s,i)=>(
                <div key={i} style={{background:P.card,border:`1.5px solid ${P.border}`,borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:i===1?16:20,fontWeight:800,color:P.orange}}>{s.val}</div>
                  <div style={{fontSize:10,color:P.muted,marginTop:3,letterSpacing:.5,textTransform:"uppercase"}}>{s.label}</div>
                </div>
              ))}
            </div>
            {myRatings.map(r=>{
              const catIdx=CAT_IDS.indexOf(r.category);
              return (
                <div key={r.id} onClick={()=>{setSelProd(r.productCode);setView("detail");}}
                  style={{background:P.card,borderRadius:14,padding:"13px 15px",marginBottom:10,border:`1.5px solid ${P.border}`,cursor:"pointer",display:"flex",gap:12,alignItems:"center",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=P.orange;e.currentTarget.style.transform="translateX(3px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.transform="";}}>
                  <div style={{width:44,height:44,borderRadius:12,background:P.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{CAT_ICONS[catIdx]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:P.orange}}>{r.brand}</div>
                    <div style={{fontSize:14,fontWeight:700,color:P.text,lineHeight:1.2}}>{r.name}{r.flavor?` — ${r.flavor}`:""}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                      {r.pros?.slice(0,2).map((p,i)=><span key={i} style={{background:P.greenLight,color:P.green,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:600}}>✓ {p}</span>)}
                      {r.cons?.slice(0,1).map((c2,i)=><span key={i} style={{background:P.redLight,color:P.red,borderRadius:8,padding:"1px 7px",fontSize:11,fontWeight:600}}>✗ {c2}</span>)}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <ScorePill score={r.score}/>
                    <div style={{fontSize:10,color:P.muted,marginTop:4}}>{timeAgo(r.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
      )}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:50}}>
        <button onClick={goToRate}
          style={{width:54,height:54,borderRadius:"50%",background:P.orange,color:"white",border:"none",fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 16px rgba(245,166,35,0.45)"}}>+</button>
      </div>
    </div>
  );
}
