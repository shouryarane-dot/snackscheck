import { useState, useEffect, useRef } from "react";
import { supabase, mapRow, mapToRow, mapProduct, upsertProduct, fetchProducts, updateProductInfo } from './supabase.js';

const LANG_KEY = "snackcheck-lang";

const LANGS = {
  nl: { appSub:"Snack beoordelingstool", allSnacks:"Alle snacks", myRatings:"Mijn ratings", search:"Zoek merk of product...", addRating:"Beoordelen", close:"✕ Sluiten", save:"Opslaan ✓", saved:"Opgeslagen!", savedSub:"Jouw beoordeling is toegevoegd.", back:"← Terug", reviews:"Beoordelingen", rateFirst:"Eerste snack beoordelen →", noRatings:"Nog geen snacks beoordeeld", noRatingsSub:"Voeg de eerste toe via de + knop", noMyRatings:"Nog geen ratings van", welcomed:"Welkom bij SnackCheck", welcomeSub:"Hoe mogen we je noemen?", yourName:"Jouw naam", namePh:"bijv. Jan", start:"Aan de slag →", brand:"Merk", brandPh:"bijv. Lays, Haribo, AH", product:"Productnaam", productPh:"bijv. Ovenbaked, Borrelnoten", flavor:"Smaak / Variant", flavorPh:"bijv. Paprika, Zeezout", category:"Categorie", rating:"Beoordeling", pros:"Pluspunten", prosPh:"bijv. Krokant, Lekker zout", cons:"Minpunten", consPh:"bijv. Te vet, Weinig smaak", photo:"Foto", photoOptional:"(optioneel)", photoTap:"Tik om een foto toe te voegen", minScore:"Min. score", onlyMulti:"Alleen 2+ ratings", reset:"✕ Reset", comma:"(komma gescheiden)", required:"*", scoreLabels:["","😕 Slecht","😐 Matig","🙂 Oké","😋 Goed","🤩 Geweldig!"], rated:"Beoordeeld", avgScore:"Gem. score", categories:"Categorieën", ratingsCount:(n)=>`${n} beoordeling${n!==1?"en":""}`, products:(n)=>`${n} product${n!==1?"en":""}`, myRatingsCount:(n,name)=>`${n} beoordeling${n!==1?"en":""} van ${name}`, you:" (jij)", sorts:["Nieuwste eerst","Oudste eerst","Hoogste score","Laagste score","Meest beoordeeld","A → Z"], cats:["Alles","Chips","Koek","Noten","Snoep","Choco","Puffs","Repen","Anders"],
    landing:{ hero1:"Snacks beoordelen.", hero2:"De lekkerste vinden.", sub:"Een community-gedreven snackdatabase. Kijk wat anderen vinden voordat je koopt — of deel jouw eerlijke mening.", cta1:"Begin met beoordelen", cta2:"Bekijk de database", how:"Hoe het werkt", howTitle:"Eerlijke ratings van echte snackliefhebbers", howSub:"Geen gesponsorde reviews. Geen algoritmes. Gewoon mensen die beoordelen wat ze echt hebben gegeten.", f1t:"Beoordeel elke snack", f1d:"Score van 1–5 sterren, voeg pluspunten en minpunten toe, upload een foto.", f2t:"Gedeelde database", f2d:"Alle beoordelingen op één plek — iedereen kan bladeren en bijdragen.", f3t:"AI productinfo & filters", f3d:"Calorieën, eiwitten, ingrediënten — automatisch opgezocht. Filter op voedingswaarden.", example:"Voorbeeld beoordeling", exampleTitle:"Zo ziet een beoordeling eruit", join:"Gratis meedoen", joinTitle:"Doe mee aan de community — het is gratis", joinSub:"Maak een account aan om je beoordelingen toe te voegen en jouw persoonlijke snackgeschiedenis op te bouwen.", joinBtn:"Gratis account aanmaken", footer:"snackscheck.com · Gemaakt met liefde voor snackliefhebbers", privacy:"Privacybeleid", exPro1:"Krokant", exPro2:"Goed gekruid", exCon1:"Duur" },
    account:{ title:"Mijn account", email:"E-mailadres", name:"Naam", deleteTitle:"Account verwijderen", deleteDesc:"Dit verwijdert al jouw beoordelingen. Stuur daarna een e-mail naar privacy@snackscheck.com om je account volledig te verwijderen.", deleteBtn:"Verwijder mijn beoordelingen & log uit", deleteConfirm:"Weet je het zeker? Dit kan niet ongedaan worden gemaakt.", yes:"Ja, verwijder", cancel:"Annuleren", logOut:"Uitloggen" },
    privacy:{ title:"Privacybeleid", lastUpdated:"Laatst bijgewerkt: juni 2025", intro:"SnacksCheck (snackscheck.com) is een hobbyproject van een particulier. We nemen jouw privacy serieus en verwerken zo min mogelijk persoonsgegevens.", s1t:"Welke gegevens verzamelen we?", s1b:"Wanneer je een account aanmaakt, bewaren we je e-mailadres en de naam die je zelf kiest. Jouw beoordelingen (merk, productnaam, score, foto's) worden opgeslagen in onze database en zijn zichtbaar voor alle bezoekers.", s2t:"Waarom bewaren we deze gegevens?", s2b:"Je e-mailadres is nodig om in te loggen en je account te beschermen. Je naam verschijnt bij jouw beoordelingen. We gebruiken jouw gegevens niet voor marketing, advertenties of profilering.", s3t:"Wie heeft toegang?", s3b:"Jouw gegevens worden opgeslagen via Supabase (database, EU-regio) en Vercel (hosting). Beide partijen hebben een AVG-compliant verwerkersovereenkomst. We delen nooit gegevens met derden.", s4t:"AI-functionaliteit", s4b:"Wanneer je een snack beoordeelt, worden de merknaam, productnaam en smaak doorgestuurd naar de Anthropic API voor nutritionele informatie. Er worden geen persoonsgegevens doorgestuurd.", s5t:"Jouw rechten", s5b:"Je hebt het recht om jouw gegevens in te zien, te corrigeren of te laten verwijderen. Je kunt jouw beoordelingen zelf verwijderen via de app. Voor volledige verwijdering van je account stuur je een e-mail naar privacy@snackscheck.com. We reageren binnen 30 dagen.", s6t:"Contact", s6b:"Vragen over dit privacybeleid? Stuur een e-mail naar privacy@snackscheck.com.", back:"← Terug" }
  },
  en: { appSub:"Snack rating tool", allSnacks:"All snacks", myRatings:"My ratings", search:"Search brand or product...", addRating:"Rate", close:"✕ Close", save:"Save ✓", saved:"Saved!", savedSub:"Your rating has been added.", back:"← Back", reviews:"Reviews", rateFirst:"Rate your first snack →", noRatings:"No snacks rated yet", noRatingsSub:"Add the first one with the + button", noMyRatings:"No ratings yet from", welcomed:"Welcome to SnackCheck", welcomeSub:"What should we call you?", yourName:"Your name", namePh:"e.g. Alex", start:"Get started →", brand:"Brand", brandPh:"e.g. Lays, Haribo", product:"Product name", productPh:"e.g. Ovenbaked, Classic", flavor:"Flavor / Variant", flavorPh:"e.g. Paprika, Sea Salt", category:"Category", rating:"Rating", pros:"Pros", prosPh:"e.g. Crunchy, Well salted", cons:"Cons", consPh:"e.g. Too greasy, Bland", photo:"Photo", photoOptional:"(optional)", photoTap:"Tap to add a photo", minScore:"Min. score", onlyMulti:"Only 2+ ratings", reset:"✕ Reset", comma:"(comma separated)", required:"*", scoreLabels:["","😕 Bad","😐 Mediocre","🙂 OK","😋 Good","🤩 Amazing!"], rated:"Rated", avgScore:"Avg. score", categories:"Categories", ratingsCount:(n)=>`${n} rating${n!==1?"s":""}`, products:(n)=>`${n} product${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} rating${n!==1?"s":""} by ${name}`, you:" (you)", sorts:["Newest first","Oldest first","Highest score","Lowest score","Most rated","A → Z"], cats:["All","Chips","Biscuit","Nuts","Candy","Choco","Puffs","Bars","Other"],
    landing:{ hero1:"Rate snacks.", hero2:"Find the good stuff.", sub:"A community-powered snack database. See what others think before you buy — or share your own honest take.", cta1:"Start rating snacks", cta2:"Browse the database", how:"How it works", howTitle:"Honest ratings from real snack lovers", howSub:"No sponsored reviews. No algorithms. Just people rating what they actually ate.", f1t:"Rate any snack", f1d:"Score from 1–5 stars, add pros and cons, upload a photo.", f2t:"Shared database", f2d:"All ratings in one place — anyone can browse and contribute.", f3t:"AI info & nutrition filters", f3d:"Calories, protein, ingredients — looked up automatically. Filter by nutrition values.", example:"Example rating", exampleTitle:"See what a rating looks like", join:"Join for free", joinTitle:"Join the community — it's free", joinSub:"Create an account to add your ratings and build your personal snack history.", joinBtn:"Create free account", footer:"snackscheck.com · Made with love for snack enthusiasts everywhere", privacy:"Privacy policy", exPro1:"Crunchy", exPro2:"Well seasoned", exCon1:"Pricey" },
    account:{ title:"My account", email:"Email address", name:"Name", deleteTitle:"Delete account", deleteDesc:"This will delete all your ratings. Then send an email to privacy@snackscheck.com to fully delete your account.", deleteBtn:"Delete my ratings & sign out", deleteConfirm:"Are you sure? This cannot be undone.", yes:"Yes, delete", cancel:"Cancel", logOut:"Sign out" },
    privacy:{ title:"Privacy Policy", lastUpdated:"Last updated: June 2025", intro:"SnacksCheck (snackscheck.com) is a personal hobby project. We take your privacy seriously and collect as little personal data as possible.", s1t:"What data do we collect?", s1b:"When you create an account, we store your email address and the display name you choose. Your ratings (brand, product name, score, photos) are stored in our database and are visible to all visitors.", s2t:"Why do we store this data?", s2b:"Your email is needed to log in and protect your account. Your name appears on your ratings. We do not use your data for marketing, advertising, or profiling.", s3t:"Who has access?", s3b:"Your data is stored via Supabase (database, EU region) and Vercel (hosting). Both have GDPR-compliant data processing agreements. We never share data with third parties.", s4t:"AI functionality", s4b:"When you rate a snack, the brand name, product name, and flavor are sent to the Anthropic API for nutritional information. No personal data is transmitted.", s5t:"Your rights", s5b:"You have the right to view, correct, or delete your data. You can delete your ratings directly in the app. For full account deletion, email privacy@snackscheck.com. We respond within 30 days.", s6t:"Contact", s6b:"Questions about this privacy policy? Email privacy@snackscheck.com.", back:"← Back" },
    tos:{ title:"Terms of Service", lastUpdated:"Last updated: July 2025", back:"← Back",
      intro:"By using SnacksCheck (snackscheck.com), you agree to these terms. SnacksCheck is a personal hobby project and a free, community-powered snack rating platform.",
      s1t:"1. Who can use SnacksCheck", s1b:"You must be at least 13 years old to create an account. By signing up, you confirm that you meet this age requirement.",
      s2t:"2. What you can and cannot post", s2b:"You may post honest snack ratings, photos of snack products, and genuine opinions. You may not post: nudity or sexually explicit content, photos of people (especially minors), hateful, abusive, or discriminatory content, spam, fake reviews, or content you don't have the right to share.",
      s3t:"3. Your content", s3b:"You own the content you post. By posting it, you grant SnacksCheck a non-exclusive, royalty-free license to display it on the platform. You can delete your own ratings at any time in the app.",
      s4t:"4. Our right to remove content", s4b:"We reserve the right to remove any content that violates these terms or that we consider harmful, without prior notice. Repeated violations may result in account suspension.",
      s5t:"5. No warranties", s5b:"SnacksCheck is provided as-is, as a hobby project. We make no guarantees about uptime, accuracy of nutritional information, or continuity of the service.",
      s6t:"6. Contact", s6b:"Questions or reports? Email privacy@snackscheck.com." }
  },
  fr: { appSub:"Outil de notation", allSnacks:"Tous les snacks", myRatings:"Mes notes", search:"Rechercher...", addRating:"Noter", close:"✕ Fermer", save:"Enregistrer ✓", saved:"Enregistré!", savedSub:"Votre note a été ajoutée.", back:"← Retour", reviews:"Avis", rateFirst:"Noter votre premier snack →", noRatings:"Aucun snack noté", noRatingsSub:"Ajoutez le premier via le bouton +", noMyRatings:"Aucune note de", welcomed:"Bienvenue sur SnackCheck", welcomeSub:"Comment vous appelle-t-on?", yourName:"Votre nom", namePh:"ex. Alex", start:"Commencer →", brand:"Marque", brandPh:"ex. Lays, Haribo", product:"Nom du produit", productPh:"ex. Ovenbaked, Classic", flavor:"Saveur / Variante", flavorPh:"ex. Paprika, Sel de mer", category:"Catégorie", rating:"Note", pros:"Points positifs", prosPh:"ex. Croustillant, Bien salé", cons:"Points négatifs", consPh:"ex. Trop gras, Sans goût", photo:"Photo", photoOptional:"(optionnel)", photoTap:"Appuyez pour ajouter une photo", minScore:"Score min.", onlyMulti:"Seulement 2+ notes", reset:"✕ Réinitialiser", comma:"(séparé par virgule)", required:"*", scoreLabels:["","😕 Mauvais","😐 Moyen","🙂 OK","😋 Bon","🤩 Excellent!"], rated:"Noté", avgScore:"Score moy.", categories:"Catégories", ratingsCount:(n)=>`${n} avis`, products:(n)=>`${n} produit${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} avis de ${name}`, you:" (moi)", sorts:["Plus récent","Plus ancien","Meilleur score","Score le plus bas","Plus noté","A → Z"], cats:["Tout","Chips","Biscuits","Noix","Bonbons","Choco","Puffs","Barres","Autre"],
    landing:{ hero1:"Notez vos snacks.", hero2:"Trouvez les meilleurs.", sub:"Une base de données de snacks par la communauté. Voyez ce que les autres pensent avant d'acheter — ou partagez votre avis.", cta1:"Commencer à noter", cta2:"Parcourir la base", how:"Comment ça marche", howTitle:"Des avis honnêtes de vrais amateurs de snacks", howSub:"Pas de reviews sponsorisées. Pas d'algorithmes. Juste des gens qui notent ce qu'ils ont vraiment mangé.", f1t:"Notez n'importe quel snack", f1d:"Score de 1 à 5 étoiles, ajoutez des points positifs et négatifs, uploadez une photo.", f2t:"Base de données partagée", f2d:"Tous les avis au même endroit — tout le monde peut consulter et contribuer.", f3t:"IA & filtres nutrition", f3d:"Calories, protéines, ingrédients — recherchés automatiquement. Filtrez par valeurs nutritionnelles.", example:"Exemple d'avis", exampleTitle:"Voilà à quoi ressemble un avis", join:"Rejoindre gratuitement", joinTitle:"Rejoignez la communauté — c'est gratuit", joinSub:"Créez un compte pour ajouter vos avis et construire votre historique de snacks.", joinBtn:"Créer un compte gratuit", footer:"snackscheck.com · Fait avec amour pour les amateurs de snacks", privacy:"Politique de confidentialité", exPro1:"Croustillant", exPro2:"Bien assaisonné", exCon1:"Cher" },
    account:{ title:"Mon compte", email:"Adresse e-mail", name:"Nom", deleteTitle:"Supprimer le compte", deleteDesc:"Cela supprimera tous vos avis. Envoyez ensuite un e-mail à privacy@snackscheck.com pour supprimer entièrement votre compte.", deleteBtn:"Supprimer mes avis & déconnexion", deleteConfirm:"Êtes-vous sûr ? Cette action est irréversible.", yes:"Oui, supprimer", cancel:"Annuler", logOut:"Déconnexion" },
    privacy:{ title:"Politique de confidentialité", lastUpdated:"Dernière mise à jour : juin 2025", intro:"SnacksCheck est un projet personnel. Nous prenons votre vie privée au sérieux.", s1t:"Quelles données collectons-nous ?", s1b:"Votre adresse e-mail et le nom d'affichage que vous choisissez. Vos avis sont visibles par tous.", s2t:"Pourquoi ?", s2b:"Votre e-mail est nécessaire pour la connexion. Nous n'utilisons pas vos données à des fins commerciales.", s3t:"Qui a accès ?", s3b:"Vos données sont stockées via Supabase et Vercel, tous deux conformes au RGPD.", s4t:"Fonctionnalité IA", s4b:"Le nom de la marque et du produit sont envoyés à l'API Anthropic. Aucune donnée personnelle n'est transmise.", s5t:"Vos droits", s5b:"Vous pouvez supprimer vos avis dans l'app. Pour la suppression complète du compte, écrivez à privacy@snackscheck.com.", s6t:"Contact", s6b:"Questions ? Écrivez à privacy@snackscheck.com.", back:"← Retour" }
  },
  es: { appSub:"Herramienta de valoración", allSnacks:"Todos los snacks", myRatings:"Mis valoraciones", search:"Buscar...", addRating:"Valorar", close:"✕ Cerrar", save:"Guardar ✓", saved:"¡Guardado!", savedSub:"Tu valoración ha sido añadida.", back:"← Volver", reviews:"Valoraciones", rateFirst:"Valorar tu primer snack →", noRatings:"Sin snacks valorados", noRatingsSub:"Añade el primero con el botón +", noMyRatings:"Sin valoraciones de", welcomed:"Bienvenido a SnackCheck", welcomeSub:"¿Cómo te llamamos?", yourName:"Tu nombre", namePh:"ej. Alex", start:"Empezar →", brand:"Marca", brandPh:"ej. Lays, Haribo", product:"Nombre del producto", productPh:"ej. Ovenbaked, Classic", flavor:"Sabor / Variante", flavorPh:"ej. Pimentón, Sal marina", category:"Categoría", rating:"Valoración", pros:"Puntos positivos", prosPh:"ej. Crujiente, Bien salado", cons:"Puntos negativos", consPh:"ej. Muy grasiento, Soso", photo:"Foto", photoOptional:"(opcional)", photoTap:"Toca para añadir una foto", minScore:"Puntuación mín.", onlyMulti:"Solo 2+ valoraciones", reset:"✕ Reiniciar", comma:"(separado por comas)", required:"*", scoreLabels:["","😕 Malo","😐 Regular","🙂 OK","😋 Bueno","🤩 ¡Genial!"], rated:"Valorado", avgScore:"Punt. media", categories:"Categorías", ratingsCount:(n)=>`${n} valoración${n!==1?"es":""}`, products:(n)=>`${n} producto${n!==1?"s":""}`, myRatingsCount:(n,name)=>`${n} valoración${n!==1?"es":""} de ${name}`, you:" (yo)", sorts:["Más reciente","Más antiguo","Mayor puntuación","Menor puntuación","Más valorado","A → Z"], cats:["Todo","Chips","Galletas","Frutos secos","Dulces","Choco","Puffs","Barritas","Otros"],
    landing:{ hero1:"Valora snacks.", hero2:"Encuentra los mejores.", sub:"Una base de datos de snacks impulsada por la comunidad. Ve lo que otros piensan antes de comprar — o comparte tu opinión.", cta1:"Empezar a valorar", cta2:"Ver la base de datos", how:"Cómo funciona", howTitle:"Valoraciones honestas de verdaderos amantes de los snacks", howSub:"Sin reviews patrocinadas. Sin algoritmos. Solo personas valorando lo que realmente comieron.", f1t:"Valora cualquier snack", f1d:"Puntuación de 1 a 5 estrellas, añade pros y contras, sube una foto.", f2t:"Base de datos compartida", f2d:"Todas las valoraciones en un lugar — cualquiera puede ver y contribuir.", f3t:"IA & filtros nutrición", f3d:"Calorías, proteínas, ingredientes — buscados automáticamente. Filtra por valores nutricionales.", example:"Valoración de ejemplo", exampleTitle:"Así es una valoración", join:"Únete gratis", joinTitle:"Únete a la comunidad — es gratis", joinSub:"Crea una cuenta para añadir tus valoraciones y construir tu historial de snacks.", joinBtn:"Crear cuenta gratis", footer:"snackscheck.com · Hecho con amor para los amantes de los snacks", privacy:"Política de privacidad", exPro1:"Crujiente", exPro2:"Bien sazonado", exCon1:"Caro" },
    account:{ title:"Mi cuenta", email:"Correo electrónico", name:"Nombre", deleteTitle:"Eliminar cuenta", deleteDesc:"Esto eliminará todas tus valoraciones. Luego envía un correo a privacy@snackscheck.com para eliminar completamente tu cuenta.", deleteBtn:"Eliminar mis valoraciones y cerrar sesión", deleteConfirm:"¿Estás seguro? Esta acción no se puede deshacer.", yes:"Sí, eliminar", cancel:"Cancelar", logOut:"Cerrar sesión" },
    privacy:{ title:"Política de privacidad", lastUpdated:"Última actualización: junio 2025", intro:"SnacksCheck es un proyecto personal. Tomamos tu privacidad en serio.", s1t:"¿Qué datos recopilamos?", s1b:"Tu correo electrónico y el nombre que eliges. Tus valoraciones son visibles para todos.", s2t:"¿Por qué?", s2b:"Tu correo es necesario para iniciar sesión. No usamos tus datos con fines comerciales.", s3t:"¿Quién tiene acceso?", s3b:"Tus datos se almacenan en Supabase y Vercel, ambos conformes al RGPD.", s4t:"Funcionalidad de IA", s4b:"El nombre de la marca y del producto se envían a la API de Anthropic. No se transmiten datos personales.", s5t:"Tus derechos", s5b:"Puedes eliminar tus valoraciones en la app. Para eliminar tu cuenta, escribe a privacy@snackscheck.com.", s6t:"Contacto", s6b:"¿Preguntas? Escribe a privacy@snackscheck.com.", back:"← Volver" }
  },
  de: { appSub:"Snack-Bewertungstool", allSnacks:"Alle Snacks", myRatings:"Meine Bewertungen", search:"Suchen...", addRating:"Bewerten", close:"✕ Schließen", save:"Speichern ✓", saved:"Gespeichert!", savedSub:"Deine Bewertung wurde hinzugefügt.", back:"← Zurück", reviews:"Bewertungen", rateFirst:"Ersten Snack bewerten →", noRatings:"Noch keine Snacks bewertet", noRatingsSub:"Füge den ersten über den + Knopf hinzu", noMyRatings:"Noch keine Bewertungen von", welcomed:"Willkommen bei SnackCheck", welcomeSub:"Wie sollen wir dich nennen?", yourName:"Dein Name", namePh:"z.B. Alex", start:"Loslegen →", brand:"Marke", brandPh:"z.B. Lays, Haribo", product:"Produktname", productPh:"z.B. Ovenbaked, Classic", flavor:"Geschmack / Variante", flavorPh:"z.B. Paprika, Meersalz", category:"Kategorie", rating:"Bewertung", pros:"Vorteile", prosPh:"z.B. Knusprig, Gut gesalzen", cons:"Nachteile", consPh:"z.B. Zu fettig, Geschmacklos", photo:"Foto", photoOptional:"(optional)", photoTap:"Tippen um ein Foto hinzuzufügen", minScore:"Mindest-Score", onlyMulti:"Nur 2+ Bewertungen", reset:"✕ Zurücksetzen", comma:"(kommagetrennt)", required:"*", scoreLabels:["","😕 Schlecht","😐 Mäßig","🙂 OK","😋 Gut","🤩 Großartig!"], rated:"Bewertet", avgScore:"Ø Score", categories:"Kategorien", ratingsCount:(n)=>`${n} Bewertung${n!==1?"en":""}`, products:(n)=>`${n} Produkt${n!==1?"e":""}`, myRatingsCount:(n,name)=>`${n} Bewertung${n!==1?"en":""} von ${name}`, you:" (ich)", sorts:["Neueste zuerst","Älteste zuerst","Höchste Bewertung","Niedrigste Bewertung","Meistbewertet","A → Z"], cats:["Alles","Chips","Kekse","Nüsse","Süßigkeiten","Schokolade","Puffs","Riegel","Sonstiges"],
    landing:{ hero1:"Snacks bewerten.", hero2:"Die besten finden.", sub:"Eine Community-betriebene Snack-Datenbank. Sieh was andere denken, bevor du kaufst — oder teile deine eigene Meinung.", cta1:"Snacks bewerten", cta2:"Datenbank durchsuchen", how:"So funktioniert's", howTitle:"Ehrliche Bewertungen von echten Snack-Liebhabern", howSub:"Keine gesponserten Reviews. Keine Algorithmen. Nur Menschen, die bewerten, was sie wirklich gegessen haben.", f1t:"Jeden Snack bewerten", f1d:"Bewertung von 1–5 Sternen, Vor- und Nachteile, Foto hochladen.", f2t:"Geteilte Datenbank", f2d:"Alle Bewertungen an einem Ort — jeder kann stöbern und beitragen.", f3t:"KI-Info & Ernährungsfilter", f3d:"Kalorien, Eiweiß, Zutaten — automatisch nachgeschlagen. Nach Nährwerten filtern.", example:"Beispielbewertung", exampleTitle:"So sieht eine Bewertung aus", join:"Kostenlos mitmachen", joinTitle:"Der Community beitreten — kostenlos", joinSub:"Erstelle ein Konto, um deine Bewertungen hinzuzufügen und deine persönliche Snack-Geschichte aufzubauen.", joinBtn:"Kostenloses Konto erstellen", footer:"snackscheck.com · Mit Liebe für Snack-Enthusiasten gemacht", privacy:"Datenschutzerklärung", exPro1:"Knusprig", exPro2:"Gut gewürzt", exCon1:"Teuer" },
    account:{ title:"Mein Konto", email:"E-Mail-Adresse", name:"Name", deleteTitle:"Konto löschen", deleteDesc:"Dadurch werden alle deine Bewertungen gelöscht. Schreibe dann eine E-Mail an privacy@snackscheck.com, um dein Konto vollständig zu löschen.", deleteBtn:"Bewertungen löschen & abmelden", deleteConfirm:"Bist du sicher? Dies kann nicht rückgängig gemacht werden.", yes:"Ja, löschen", cancel:"Abbrechen", logOut:"Abmelden" },
    privacy:{ title:"Datenschutzerklärung", lastUpdated:"Letzte Aktualisierung: Juni 2025", intro:"SnacksCheck ist ein persönliches Hobbyprojekt. Wir nehmen deinen Datenschutz ernst.", s1t:"Welche Daten sammeln wir?", s1b:"Deine E-Mail-Adresse und den Anzeigenamen, den du wählst. Deine Bewertungen sind für alle sichtbar.", s2t:"Warum?", s2b:"Deine E-Mail wird für die Anmeldung benötigt. Wir nutzen deine Daten nicht für Marketing.", s3t:"Wer hat Zugriff?", s3b:"Deine Daten werden über Supabase und Vercel gespeichert, beide DSGVO-konform.", s4t:"KI-Funktionalität", s4b:"Marken- und Produktname werden an die Anthropic API gesendet. Keine personenbezogenen Daten.", s5t:"Deine Rechte", s5b:"Du kannst deine Bewertungen in der App löschen. Für die vollständige Kontolöschung schreibe an privacy@snackscheck.com.", s6t:"Kontakt", s6b:"Fragen? Schreibe an privacy@snackscheck.com.", back:"← Zurück" }
  },
  it: { appSub:"Strumento di valutazione", allSnacks:"Tutti gli snack", myRatings:"Le mie valutazioni", search:"Cerca...", addRating:"Valuta", close:"✕ Chiudi", save:"Salva ✓", saved:"Salvato!", savedSub:"La tua valutazione è stata aggiunta.", back:"← Indietro", reviews:"Valutazioni", rateFirst:"Valuta il tuo primo snack →", noRatings:"Nessuno snack valutato", noRatingsSub:"Aggiungi il primo con il pulsante +", noMyRatings:"Nessuna valutazione di", welcomed:"Benvenuto su SnackCheck", welcomeSub:"Come ti chiamiamo?", yourName:"Il tuo nome", namePh:"es. Alex", start:"Inizia →", brand:"Marca", brandPh:"es. Lays, Haribo", product:"Nome prodotto", productPh:"es. Ovenbaked, Classic", flavor:"Gusto / Variante", flavorPh:"es. Paprika, Sale marino", category:"Categoria", rating:"Valutazione", pros:"Punti positivi", prosPh:"es. Croccante, Ben salato", cons:"Punti negativi", consPh:"es. Troppo unto, Insipido", photo:"Foto", photoOptional:"(opzionale)", photoTap:"Tocca per aggiungere una foto", minScore:"Punteggio min.", onlyMulti:"Solo 2+ valutazioni", reset:"✕ Reimposta", comma:"(separato da virgole)", required:"*", scoreLabels:["","😕 Pessimo","😐 Mediocre","🙂 OK","😋 Buono","🤩 Eccellente!"], rated:"Valutato", avgScore:"Punteggio medio", categories:"Categorie", ratingsCount:(n)=>`${n} valutazion${n!==1?"i":"e"}`, products:(n)=>`${n} prodott${n!==1?"i":"o"}`, myRatingsCount:(n,name)=>`${n} valutazion${n!==1?"i":"e"} di ${name}`, you:" (io)", sorts:["Più recente","Più vecchio","Punteggio più alto","Punteggio più basso","Più valutato","A → Z"], cats:["Tutto","Chips","Biscotti","Noci","Dolci","Cioccolato","Puffs","Barrette","Altro"],
    landing:{ hero1:"Valuta gli snack.", hero2:"Trova i migliori.", sub:"Un database di snack alimentato dalla community. Guarda cosa pensano gli altri prima di acquistare — o condividi la tua opinione.", cta1:"Inizia a valutare", cta2:"Sfoglia il database", how:"Come funziona", howTitle:"Valutazioni oneste da veri amanti degli snack", howSub:"Nessuna recensione sponsorizzata. Nessun algoritmo. Solo persone che valutano quello che hanno davvero mangiato.", f1t:"Valuta qualsiasi snack", f1d:"Punteggio da 1 a 5 stelle, aggiungi pro e contro, carica una foto.", f2t:"Database condiviso", f2d:"Tutte le valutazioni in un posto — chiunque può sfogliare e contribuire.", f3t:"IA & filtri nutrizione", f3d:"Calorie, proteine, ingredienti — ricercati automaticamente. Filtra per valori nutrizionali.", example:"Valutazione di esempio", exampleTitle:"Ecco come appare una valutazione", join:"Unisciti gratis", joinTitle:"Unisciti alla community — è gratis", joinSub:"Crea un account per aggiungere le tue valutazioni e costruire la tua storia di snack.", joinBtn:"Crea account gratuito", footer:"snackscheck.com · Fatto con amore per gli appassionati di snack", privacy:"Informativa sulla privacy", exPro1:"Croccante", exPro2:"Ben condito", exCon1:"Caro" },
    account:{ title:"Il mio account", email:"Indirizzo email", name:"Nome", deleteTitle:"Elimina account", deleteDesc:"Questo eliminerà tutte le tue valutazioni. Poi invia un'email a privacy@snackscheck.com per eliminare completamente il tuo account.", deleteBtn:"Elimina le mie valutazioni e disconnetti", deleteConfirm:"Sei sicuro? Questa azione non può essere annullata.", yes:"Sì, elimina", cancel:"Annulla", logOut:"Disconnetti" },
    privacy:{ title:"Informativa sulla privacy", lastUpdated:"Ultimo aggiornamento: giugno 2025", intro:"SnacksCheck è un progetto personale. Prendiamo sul serio la tua privacy.", s1t:"Quali dati raccogliamo?", s1b:"Il tuo indirizzo email e il nome che scegli. Le tue valutazioni sono visibili a tutti.", s2t:"Perché?", s2b:"La tua email è necessaria per accedere. Non usiamo i tuoi dati per scopi commerciali.", s3t:"Chi ha accesso?", s3b:"I tuoi dati sono archiviati tramite Supabase e Vercel, entrambi conformi al GDPR.", s4t:"Funzionalità AI", s4b:"Il nome del marchio e del prodotto vengono inviati all'API di Anthropic. Nessun dato personale viene trasmesso.", s5t:"I tuoi diritti", s5b:"Puoi eliminare le tue valutazioni nell'app. Per l'eliminazione completa dell'account, scrivi a privacy@snackscheck.com.", s6t:"Contatto", s6b:"Domande? Scrivi a privacy@snackscheck.com.", back:"← Indietro" }
  },
};

const LANG_FLAGS = { nl:"🇳🇱", en:"🇬🇧", fr:"🇫🇷", es:"🇪🇸", de:"🇩🇪", it:"🇮🇹" };
const CAT_ICONS = ["🛒","🥔","🍪","🥜","🍬","🍫","🍿","🌾","📦"];
const CAT_IDS   = ["all","chips","koek","noten","snoep","chocolade","popcorn","repen","anders"];
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
  const parseResult = (p, brand, name, flavor) => {
    const n = p.nutriments || {};
    return {
      description: `${p.brands||brand} ${p.product_name||name}. ${flavor} variant.`,
      per100g: {
        calories: Math.round(n["energy-kcal_100g"]||n["energy_100g"]/4.184||0),
        protein:  Math.round((n.proteins_100g||0)*10)/10,
        fat:      Math.round((n.fat_100g||0)*10)/10,
        carbs:    Math.round((n.carbohydrates_100g||0)*10)/10,
        sugar:    Math.round((n.sugars_100g||0)*10)/10,
        salt:     Math.round((n.salt_100g||0)*10)/10,
        fibre:    Math.round((n.fiber_100g||0)*10)/10,
      },
      servingSize: parseInt(p.serving_size)||null,
      ingredients: p.ingredients_text_en||p.ingredients_text||"",
      ingredientsByLang: {
        en: p.ingredients_text_en||p.ingredients_text||"",
        nl: p.ingredients_text_nl||p.ingredients_text_en||p.ingredients_text||"",
        fr: p.ingredients_text_fr||p.ingredients_text_en||p.ingredients_text||"",
        de: p.ingredients_text_de||p.ingredients_text_en||p.ingredients_text||"",
        es: p.ingredients_text_es||p.ingredients_text_en||p.ingredients_text||"",
        it: p.ingredients_text_it||p.ingredients_text_en||p.ingredients_text||"",
      },
      allergens: (()=>{
        // Use allergens_tags if available
        let list = (p.allergens_tags||[]).map(a=>a.replace(/^[a-z]+:/,"").toLowerCase());
        // Also extract from _highlighted_ allergen markers in ingredients text
        const ingRaw = p.ingredients_text_en||p.ingredients_text||"";
        const highlighted = [...ingRaw.matchAll(/_([^_]+)_/g)].map(m=>m[1].toLowerCase());
        // Fallback: scan ingredients for known allergen keywords
        const ingLower = ingRaw.toLowerCase();
        const ALLERGEN_KEYWORDS = {
          milk:     ["milk","dairy","lactose","whey","casein","butter","cream","cheese","lait","lacto"],
          gluten:   ["wheat","gluten","barley","rye","oats","flour","tarwe","blé"],
          eggs:     ["egg","eggs","oeuf"],
          nuts:     ["almond","cashew","walnut","hazelnut","pistachio","pecan","macadamia","tree nut","noten","noisette"],
          peanuts:  ["peanut","groundnut","arachide","erdnuss"],
          soy:      ["soy","soya","soybean","soja"],
          fish:     ["fish","cod","salmon","tuna","anchovy","poisson"],
          shellfish:["shellfish","shrimp","prawn","crab","lobster","crevette"],
          sesame:   ["sesame","tahini","sésame"],
        };
        const detected = Object.entries(ALLERGEN_KEYWORDS)
          .filter(([,keywords])=>keywords.some(k=>ingLower.includes(k)||highlighted.some(h=>h.includes(k))))
          .map(([allergen])=>allergen);
        return [...new Set([...list,...detected])];
      })(),
      confidence: "high",
      source: "Open Food Facts",
    };
  };
  const search = async (q) => {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5&lc=en&fields=product_name,brands,nutriments,ingredients_text,ingredients_text_en,ingredients_text_nl,ingredients_text_fr,ingredients_text_de,ingredients_text_es,ingredients_text_it,serving_size,allergens_tags`);
    const d = await res.json();
    const prods = d.products || [];
    // Prefer a result that has English ingredients text
    return prods.find(p=>p.ingredients_text_en) || prods[0] || null;
  };
  try {
    // Deduplicate: remove brand words that already appear in name
    const brandWords = brand.toLowerCase().split(/\s+/);
    const cleanName = name.split(/\s+/).filter(w=>!brandWords.includes(w.toLowerCase())).join(" ").trim() || name;

    // Try progressively simpler queries
    const queries = [
      `${brand} ${cleanName} ${flavor}`,   // brand + deduplicated name + flavor
      `${brand} ${flavor}`,                  // brand + flavor only
      `${brand} ${cleanName}`,               // brand + deduplicated name
      brand,                                 // brand only
    ];
    for (const q of queries) {
      const p = await search(q);
      if (p && p.nutriments && Object.keys(p.nutriments).length > 0) return parseResult(p, brand, name, flavor);
    }
    return null;
  } catch { return null; }
}

// ── Shared UI ────────────────────────────────────────────────────────────────
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
function ProductInfoCard({info, lang="en"}) {
  const [infoTab, setInfoTab] = useState("nutrition");
  if(!info) return null;
  const ingText = info.ingredientsByLang?.[lang] || info.ingredientsByLang?.en || info.ingredients || "";
  const ingList = ingText ? ingText.split(",") : [];
  return (
    <div style={{background:"#111",borderRadius:12,padding:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:11,fontWeight:700,color:P.orange,letterSpacing:1,textTransform:"uppercase"}}>Product Info</span>
        <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"#222",
          color:info.confidence==="high"?"#22C55E":info.confidence==="medium"?"#FFB800":"#EF4444"}}>
          {info.confidence} confidence
        </span>
      </div>
      {info.description&&<p style={{fontSize:13,color:"#ccc",margin:"0 0 12px",lineHeight:1.5}}>{info.description}</p>}
      <div style={{display:"flex",background:"#1a1a1a",borderRadius:8,padding:3,marginBottom:12,gap:3}}>
        {["nutrition","ingredients"].map(tb=>(
          <button key={tb} onClick={()=>setInfoTab(tb)}
            style={{flex:1,padding:"6px",border:"none",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600,
              background:infoTab===tb?P.orange:"transparent",color:infoTab===tb?"white":"#666",transition:"all .15s"}}>
            {tb==="nutrition"?"Nutrition":"Ingredients"}
          </button>
        ))}
      </div>
      {infoTab==="nutrition"&&info.per100g&&(
        <div>
          <div style={{fontSize:11,color:"#666",marginBottom:6}}>PER 100g{info.servingSize?` · serving ~${info.servingSize}g`:""}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[{label:"Calories",val:`${info.per100g.calories} kcal`},{label:"Protein",val:`${info.per100g.protein}g`},{label:"Fat",val:`${info.per100g.fat}g`},{label:"Carbs",val:`${info.per100g.carbs}g`},{label:"Sugar",val:`${info.per100g.sugar}g`},{label:"Salt",val:`${info.per100g.salt}g`},{label:"Fibre",val:`${info.per100g.fibre??"—"}${info.per100g.fibre!=null?"g":""}`}].map((n,i)=>(
              <div key={i} style={{background:"#1a1a1a",borderRadius:8,padding:"7px 8px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"white"}}>{n.val}</div>
                <div style={{fontSize:10,color:"#666",marginTop:2}}>{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {infoTab==="ingredients"&&(
        <div style={{fontSize:13,color:"#bbb",lineHeight:1.9}}>
          {ingList.length>0?ingList.map((ing,i)=>{
            const parts = ing.trim().split(/(_[^_]+_)/g);
            return (
              <span key={i}>
                {parts.map((part,j)=>
                  part.startsWith("_")&&part.endsWith("_")
                    ? <span key={j} style={{color:"#FFB800",fontWeight:700,textDecoration:"underline"}} title="Allergen">{part.slice(1,-1)}</span>
                    : <span key={j} style={{color:"white",fontWeight:500}}>{part}</span>
                )}
                {i<ingList.length-1&&<span style={{color:"#444"}}>, </span>}
              </span>
            );
          }):<span style={{color:"#555",fontStyle:"italic"}}>No ingredients data available.</span>}
        </div>
      )}
      <div style={{fontSize:10,color:"#444",marginTop:10}}>* Source: Open Food Facts (openfoodfacts.org). May not reflect exact packaging values.</div>
    </div>
  );
}

const inp = {width:"100%",border:`1.5px solid ${P.border}`,borderRadius:10,padding:"11px 14px",fontSize:15,outline:"none",boxSizing:"border-box",background:"#FAFAFA",fontFamily:"system-ui,sans-serif",color:P.text,transition:"border .15s",display:"block"};
const lbl = {fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:P.muted,display:"block",marginBottom:6,fontFamily:"system-ui,sans-serif"};

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, t, onOpenTos }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const canSubmit = mode==='signup'?(name.trim()&&email&&password.length>=6&&ageConfirmed):(email&&password);
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
  const sendReset = async () => {
    if(!email){setError('Enter your email address first.');return;}
    setBusy(true); setError('');
    const {error:err}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}`});
    setBusy(false);
    if(err){setError(err.message);}else{setResetSent(true);}
  };
  return (
    <div style={{background:P.card,borderRadius:20,padding:28,maxWidth:340,width:"100%",margin:"0 auto",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
      <div style={{width:56,height:56,borderRadius:16,background:P.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16}}>🍬</div>
      <div style={{display:"flex",background:"#F5F5F5",borderRadius:12,padding:3,marginBottom:20,gap:3}}>
        {[['login','Log in'],['signup','Sign up']].map(([m,label])=>(
          <button key={m} onClick={()=>{setMode(m);setError('');setResetSent(false);}}
            style={{flex:1,padding:"8px",border:"none",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,
              background:mode===m?P.orange:"transparent",color:mode===m?"white":"#888",transition:"all .15s"}}>{label}</button>
        ))}
      </div>
      {mode==='signup'&&<><label style={lbl}>{t.yourName} *</label><input style={{...inp,marginBottom:12}} placeholder={t.namePh} value={name} onChange={e=>setName(e.target.value)} autoFocus onKeyDown={e=>e.key==='Enter'&&submit()}/></>}
      <label style={lbl}>Email *</label>
      <input style={{...inp,marginBottom:12}} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} autoFocus={mode==='login'} onKeyDown={e=>e.key==='Enter'&&submit()}/>
      {mode==='login'&&!resetSent&&<>
        <label style={lbl}>Password *</label>
        <input style={{...inp,marginBottom:6}} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
        <div style={{textAlign:"right",marginBottom:16}}>
          <button onClick={sendReset} disabled={busy}
            style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:12,fontWeight:600,padding:0}}>
            Forgot password?
          </button>
        </div>
      </>}
      {mode==='signup'&&<><label style={lbl}>Password * <span style={{textTransform:"none",fontWeight:400,letterSpacing:0,fontSize:10}}>(min. 6 characters)</span></label>
        <input style={{...inp,marginBottom:16}} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
        <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:error?8:20,cursor:"pointer",fontSize:13,color:P.muted,lineHeight:1.5}}>
          <input type="checkbox" checked={ageConfirmed} onChange={e=>setAgeConfirmed(e.target.checked)} style={{marginTop:3,accentColor:P.orange,width:15,height:15,flexShrink:0}}/>
          I confirm I am 13 or older and agree to the <button onClick={onOpenTos} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:13,fontWeight:600,padding:0,textDecoration:"underline"}}>Terms of Service</button>
        </label>
      </>}
      {resetSent&&<div style={{fontSize:13,color:P.green,marginBottom:14,padding:"10px 12px",background:P.greenLight,borderRadius:8}}>✓ Password reset email sent! Check your inbox.</div>}
      {error&&<div style={{fontSize:13,color:P.red,marginBottom:14,padding:"8px 12px",background:P.redLight,borderRadius:8}}>{error}</div>}
      {!resetSent&&<button onClick={submit} disabled={busy||!canSubmit}
        style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:(busy||!canSubmit)?P.muted:P.orange,color:"white",fontWeight:700,fontSize:15,cursor:(busy||!canSubmit)?"not-allowed":"pointer",transition:"background .15s"}}>
        {busy?'...':(mode==='login'?'Log in →':'Create account →')}
      </button>}
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function SnackCheck() {
  const [lang,setLang]=useState("nl");
  const [showLangPicker,setShowLangPicker]=useState(false);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("landing");
  const [tab,setTab]=useState("all");
  const [ratings,setRatings]=useState([]);
  const [cat,setCat]=useState("all");
  const [search,setSearch]=useState("");
  const [selProd,setSelProd]=useState(null);
  const [sortBy,setSortBy]=useState("recent");
  const [showFilter,setShowFilter]=useState(false);
  const [minScore,setMinScore]=useState(0);
  const [onlyMulti,setOnlyMulti]=useState(false); // kept for legacy, UI removed
  const [filterBrand,setFilterBrand]=useState("");
  const [filterFlavor,setFilterFlavor]=useState("");
  const [maxCalories,setMaxCalories]=useState(0);
  const [minProtein,setMinProtein]=useState(0);
  const [minFibre,setMinFibre]=useState(0);
  const [avoidAllergens,setAvoidAllergens]=useState([]);
  const [form,setForm]=useState({brand:"",name:"",flavor:"",category:"chips",score:0,pros:"",cons:"",image:null,location:""});
  const [acQuery,setAcQuery]=useState("");
  const [acOpen,setAcOpen]=useState(false);
  const [products,setProducts]=useState([]);
  const [newPw,setNewPw]=useState("");
  const [pwBusy,setPwBusy]=useState(false);
  const [pwDone,setPwDone]=useState(false);
  const [pwErr,setPwErr]=useState("");
  const [productInfo,setProductInfo]=useState(null);
  const [infoLoading,setInfoLoading]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [showAuthModal,setShowAuthModal]=useState(false);
  const [deleteConfirmed,setDeleteConfirmed]=useState(false);
  const [deleteBusy,setDeleteBusy]=useState(false);
  const [backfillBusy,setBackfillBusy]=useState(false);
  const [backfillDone,setBackfillDone]=useState(false);
  const infoDebRef=useRef();
  const t = LANGS[lang];
  const l = t.landing;
  const pa = t.account;
  const pp = t.privacy;
  const userName = user?.user_metadata?.display_name;

  useEffect(()=>{
    // Detect password recovery flow from URL hash
    const hash = window.location.hash;
    if(hash.includes("type=recovery")) setView("resetPassword");

    supabase.auth.getSession().then(({data:{session}})=>setUser(session?.user??null));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      setUser(session?.user??null);
      if(event==="PASSWORD_RECOVERY") setView("resetPassword");
    });
    (async()=>{
      const {data,error}=await supabase.from('ratings').select('*').order('timestamp',{ascending:false});
      if(!error&&data) setRatings(data.map(mapRow));
      const prods=await fetchProducts();
      setProducts(prods);
      const saved=localStorage.getItem(LANG_KEY);
      if(saved&&LANGS[saved]) setLang(saved);
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
      // 1. Check our own database first
      const prodCode=toCode(form.brand,form.name,form.flavor);
      const existing=ratings.find(r=>r.productCode===prodCode&&r.productInfo);
      if(existing){
        setProductInfo(existing.productInfo);
        setInfoLoading(false);
        return;
      }
      // 2. Fall back to Open Food Facts
      const info=await fetchProductInfo(form.brand,form.name,form.flavor);
      setProductInfo(info);
      setInfoLoading(false);
    },900);
  },[form.brand,form.name,form.flavor,view]);

  const handleLang = code=>{setLang(code);setShowLangPicker(false);localStorage.setItem(LANG_KEY,code);};
  const goToRate = ()=>{if(!user){setShowAuthModal(true);}else{setView("rate");}};
  const avg = list=>list.reduce((s,r)=>s+r.score,0)/list.length;

  const handleBackfill = async () => {
    setBackfillBusy(true);
    // Always re-fetch all — ensures stale/wrong-language data gets corrected
    const missing = products;
    for(const p of missing) {
      const info = await fetchProductInfo(p.brand, p.name, p.flavor);
      if(info) await updateProductInfo(p.productCode, info);
    }
    const prods = await fetchProducts();
    setProducts(prods);
    setBackfillBusy(false);
    setBackfillDone(true);
  };

  const handleDeleteAccount = async () => {
    if(!user||deleteBusy) return;
    setDeleteBusy(true);
    await supabase.from('ratings').delete().eq('user_id',user.id);
    await supabase.auth.signOut();
    setDeleteBusy(false);
    setDeleteConfirmed(false);
    setView("landing");
  };

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
    .filter(c=>{if(minFibre===0)return true;const v=productNutrient(grouped[c],"fibre");return v!=null&&v>=minFibre;})
    .filter(c=>{
      if(avoidAllergens.length===0) return true;
      const prod=products.find(p=>p.productCode===c);
      const storedAllergens=prod?.productInfo?.allergens||[];
      // Also scan ingredients text directly — works even if backfill didn't store allergens
      const ingText=(prod?.productInfo?.ingredientsByLang?.en||prod?.productInfo?.ingredients||"").toLowerCase();
      const ALLERGEN_KEYWORDS={
        milk:     ["milk","dairy","lactose","whey","casein","butter","cream","cheese"],
        gluten:   ["wheat","gluten","barley","rye","oats"],
        eggs:     ["egg","eggs"],
        nuts:     ["almond","cashew","walnut","hazelnut","pistachio","pecan","macadamia"],
        peanuts:  ["peanut","groundnut","arachide"],
        soy:      ["soy","soya","soybean","soja"],
        fish:     ["fish","cod","salmon","tuna","anchovy"],
        shellfish:["shellfish","shrimp","prawn","crab","lobster"],
        sesame:   ["sesame","tahini"],
      };
      const detectedAllergens=Object.entries(ALLERGEN_KEYWORDS)
        .filter(([,kws])=>kws.some(k=>ingText.includes(k)))
        .map(([allergen])=>allergen);
      const allergens=[...new Set([...storedAllergens,...detectedAllergens])];
      return !avoidAllergens.some(avoid=>allergens.some(a=>a.includes(avoid)||avoid.includes(a)));
    });
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

  const filterCount=(minScore>0?1:0)+(filterBrand?1:0)+(filterFlavor?1:0)+(maxCalories>0?1:0)+(minProtein>0?1:0)+(minFibre>0?1:0)+(avoidAllergens.length>0?1:0);

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

    // Upsert product — fetch nutritional info if not already known
    const existingProd = products.find(p=>p.productCode===prodCode);
    let info = existingProd?.productInfo || null;
    if(!info) {
      info = await fetchProductInfo(form.brand, form.name, form.flavor);
    }
    await upsertProduct(form.brand, form.name, form.flavor, form.category, prodCode, info);
    // Refresh products list
    const prods = await fetchProducts();
    setProducts(prods);

    const r={id:Date.now(),userId:user.id,productCode:prodCode,brand:form.brand,name:form.name,
      flavor:form.flavor,category:form.category,score:form.score,
      pros:form.pros.split(",").map(s=>s.trim()).filter(Boolean),
      cons:form.cons.split(",").map(s=>s.trim()).filter(Boolean),
      image:form.image||null,productInfo:null,timestamp:Date.now(),rater:userName,location:form.location.trim()||null};
    const {error}=await supabase.from('ratings').insert([mapToRow(r)]);
    if(error){console.error(error);return;}
    setRatings(prev=>[...prev,r]);
    setSubmitted(true);
    setTimeout(()=>{setSubmitted(false);setView("home");setForm({brand:"",name:"",flavor:"",category:"chips",score:0,pros:"",cons:"",image:null,location:""});setProductInfo(null);setAcQuery("");setAcOpen(false);},2000);
  };

  const authModal = showAuthModal&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>e.target===e.currentTarget&&setShowAuthModal(false)}>
      <AuthModal onClose={()=>setShowAuthModal(false)} t={t} onOpenTos={()=>{setShowAuthModal(false);setView("tos");}}/>
    </div>
  );

  function LangPicker({light=false}) {
    return (
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowLangPicker(p=>!p)}
          style={{background:light?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.06)",color:light?"white":P.text,border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:16}}>
          {LANG_FLAGS[lang]}
        </button>
        {showLangPicker&&(
          <div style={{position:"absolute",right:0,top:36,background:P.card,borderRadius:12,border:`1.5px solid ${P.border}`,overflow:"hidden",zIndex:300,minWidth:140,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            {Object.keys(LANGS).map(code=>(
              <button key={code} onClick={()=>handleLang(code)}
                style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",background:lang===code?P.orangeLight:"white",cursor:"pointer",fontSize:13,fontWeight:lang===code?700:400,color:lang===code?P.orange:P.text,borderBottom:`1px solid ${P.border}`}}>
                <span style={{fontSize:16}}>{LANG_FLAGS[code]}</span>
                {{nl:"Nederlands",en:"English",fr:"Français",es:"Español",de:"Deutsch",it:"Italiano"}[code]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function Header({subtitle,action}) {
    return (
      <div style={{background:P.orange,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setView("landing")}>
          <div style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍬</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:"white",letterSpacing:-0.5,lineHeight:1}}>SnacksCheck</div>
            {subtitle&&<div style={{fontSize:10,color:"rgba(255,255,255,0.7)",letterSpacing:1.5,textTransform:"uppercase",marginTop:1}}>{subtitle}</div>}
          </div>
        </div>
        {action||<div style={{display:"flex",alignItems:"center",gap:8}}>
          {user
            ? <><div style={{cursor:"pointer"}} onClick={()=>setView("account")}><Avatar name={userName} size={30}/></div>
                <button onClick={()=>supabase.auth.signOut()}
                  style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                  {pa.logOut}
                </button>
              </>
            : <button onClick={()=>setShowAuthModal(true)}
                style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
                Log in
              </button>
          }
          <LangPicker light/>
        </div>}
      </div>
    );
  }

  if(loading) return <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",color:P.muted,fontSize:14}}>Loading...</div>;

  if(submitted) return (
    <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:P.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>✅</div>
      <div style={{fontSize:22,fontWeight:700,color:P.text}}>{t.saved}</div>
      <div style={{color:P.muted,fontSize:14}}>{t.savedSub}</div>
    </div>
  );

  // ── Privacy policy ────────────────────────────────────────────────────────
  if(view==="privacy") return (
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
      <Header subtitle={pp.title}/>
      {authModal}
      <div style={{padding:"24px 20px",maxWidth:600,margin:"0 auto"}}>
        <button onClick={()=>setView("landing")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:14,fontWeight:700,padding:0,marginBottom:24}}>{pp.back}</button>
        <h1 style={{fontSize:24,fontWeight:800,color:P.text,marginBottom:6}}>{pp.title}</h1>
        <p style={{fontSize:13,color:P.muted,marginBottom:28}}>{pp.lastUpdated}</p>
        <p style={{fontSize:14,color:P.muted,lineHeight:1.7,marginBottom:24}}>{pp.intro}</p>
        {[
          {title:pp.s1t, body:pp.s1b},
          {title:pp.s2t, body:pp.s2b},
          {title:pp.s3t, body:pp.s3b},
          {title:pp.s4t, body:pp.s4b},
          {title:pp.s5t, body:pp.s5b},
          {title:pp.s6t, body:pp.s6b},
        ].map((s,i)=>(
          <div key={i} style={{marginBottom:24}}>
            <div style={{fontSize:15,fontWeight:700,color:P.text,marginBottom:6}}>{s.title}</div>
            <div style={{fontSize:14,color:P.muted,lineHeight:1.7}}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Reset Password ────────────────────────────────────────────────────────
  if(view==="resetPassword") {
    const saveNewPw = async () => {
      if(newPw.length<6){setPwErr("Password must be at least 6 characters.");return;}
      setPwBusy(true); setPwErr("");
      const {error}=await supabase.auth.updateUser({password:newPw});
      setPwBusy(false);
      if(error){setPwErr(error.message);}
      else{setPwDone(true);setTimeout(()=>setView("home"),2000);}
    };
    return (
      <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:P.card,borderRadius:20,padding:32,maxWidth:340,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.10)"}}>
          <div style={{width:56,height:56,borderRadius:16,background:P.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:16}}>🔑</div>
          <h2 style={{fontSize:20,fontWeight:800,color:P.text,marginBottom:6}}>Set new password</h2>
          <p style={{fontSize:14,color:P.muted,marginBottom:20}}>Choose a new password for your account.</p>
          {pwDone
            ? <div style={{fontSize:14,color:P.green,fontWeight:600,padding:"12px",background:P.greenLight,borderRadius:10}}>✓ Password updated! Taking you to the app...</div>
            : <>
              <input type="password" placeholder="New password (min. 6 characters)"
                style={{...inp,marginBottom:12}} value={newPw} onChange={e=>setNewPw(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveNewPw()} autoFocus/>
              {pwErr&&<div style={{fontSize:13,color:P.red,marginBottom:12,padding:"8px 12px",background:P.redLight,borderRadius:8}}>{pwErr}</div>}
              <button onClick={saveNewPw} disabled={pwBusy}
                style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:pwBusy?P.muted:P.orange,color:"white",fontWeight:700,fontSize:15,cursor:pwBusy?"not-allowed":"pointer"}}>
                {pwBusy?"Saving...":"Save new password →"}
              </button>
            </>}
        </div>
      </div>
    );
  }

  // ── Terms of Service ──────────────────────────────────────────────────────
  if(view==="tos") {
    const tos = LANGS.en.tos;
    return (
      <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
        <Header subtitle={tos.title}/>
        {authModal}
        <div style={{padding:"24px 20px",maxWidth:600,margin:"0 auto"}}>
          <button onClick={()=>setView("landing")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:14,fontWeight:700,padding:0,marginBottom:24}}>{tos.back}</button>
          <h1 style={{fontSize:24,fontWeight:800,color:P.text,marginBottom:6}}>{tos.title}</h1>
          <p style={{fontSize:13,color:P.muted,marginBottom:28}}>{tos.lastUpdated}</p>
          <p style={{fontSize:14,color:P.muted,lineHeight:1.7,marginBottom:24}}>{tos.intro}</p>
          {[
            {title:tos.s1t, body:tos.s1b},
            {title:tos.s2t, body:tos.s2b},
            {title:tos.s3t, body:tos.s3b},
            {title:tos.s4t, body:tos.s4b},
            {title:tos.s5t, body:tos.s5b},
            {title:tos.s6t, body:tos.s6b},
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:24}}>
              <div style={{fontSize:15,fontWeight:700,color:P.text,marginBottom:6}}>{s.title}</div>
              <div style={{fontSize:14,color:P.muted,lineHeight:1.7}}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Account page ──────────────────────────────────────────────────────────
  if(view==="account"&&user) return (
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
      <Header subtitle={pa.title}/>
      {authModal}
      <div style={{padding:"24px 20px",maxWidth:480,margin:"0 auto"}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:14,fontWeight:700,padding:0,marginBottom:24}}>{t.back}</button>
        <div style={{background:P.card,borderRadius:16,border:`1.5px solid ${P.border}`,padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <Avatar name={userName} size={52}/>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:P.text}}>{userName}</div>
              <div style={{fontSize:13,color:P.muted}}>{user.email}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[
              {label:t.rated, val:ratings.filter(r=>r.userId===user.id).length},
              {label:t.categories, val:[...new Set(ratings.filter(r=>r.userId===user.id).map(r=>r.category))].length},
            ].map((s,i)=>(
              <div key={i} style={{background:P.bg,borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:800,color:P.orange}}>{s.val}</div>
                <div style={{fontSize:11,color:P.muted,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:P.card,borderRadius:16,border:`1.5px solid ${P.border}`,padding:20,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:8}}>Legal</div>
          <div style={{display:"flex",gap:16}}>
            <button onClick={()=>setView("privacy")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:13,padding:0,fontWeight:600}}>{l.privacy} →</button>
            <button onClick={()=>setView("tos")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:13,padding:0,fontWeight:600}}>Terms of Service →</button>
          </div>
        </div>

        {user?.email==='shourya.rane@gmail.com'&&(
          <div style={{background:"#F0FFF4",borderRadius:16,border:`1.5px solid #86EFAC`,padding:20,marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:700,color:"#166534",marginBottom:8}}>🛠 Admin: Backfill nutritional info</div>
            <p style={{fontSize:13,color:"#166534",lineHeight:1.6,marginBottom:16}}>Fetches nutritional info from Open Food Facts for all products missing it. Run after adding new products.</p>
            {backfillDone
              ? <div style={{fontSize:13,color:P.green,fontWeight:600}}>✓ Done! Nutritional info updated.</div>
              : <button onClick={handleBackfill} disabled={backfillBusy}
                  style={{background:"#16A34A",color:"white",border:"none",borderRadius:10,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  {backfillBusy?"Fetching... (this may take a moment)":"Run backfill →"}
                </button>
            }
          </div>
        )}
        <div style={{background:P.redLight,borderRadius:16,border:`1.5px solid #fca5a5`,padding:20}}>
          <div style={{fontSize:15,fontWeight:700,color:P.red,marginBottom:8}}>{pa.deleteTitle}</div>
          <p style={{fontSize:13,color:"#7f1d1d",lineHeight:1.6,marginBottom:16}}>{pa.deleteDesc}</p>
          {!deleteConfirmed
            ? <button onClick={()=>setDeleteConfirmed(true)}
                style={{background:"white",color:P.red,border:`1.5px solid ${P.red}`,borderRadius:10,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                {pa.deleteBtn}
              </button>
            : <div style={{display:"flex",gap:10}}>
                <button onClick={handleDeleteAccount} disabled={deleteBusy}
                  style={{background:P.red,color:"white",border:"none",borderRadius:10,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                  {deleteBusy?"...":pa.yes}
                </button>
                <button onClick={()=>setDeleteConfirmed(false)}
                  style={{background:"white",color:P.muted,border:`1.5px solid ${P.border}`,borderRadius:10,padding:"10px 18px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                  {pa.cancel}
                </button>
              </div>
          }
        </div>
      </div>
    </div>
  );

  // ── Landing page ──────────────────────────────────────────────────────────
  if(view==="landing") return (
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
      {authModal}
      <div style={{background:P.orange,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🍬</div>
          <div style={{fontSize:18,fontWeight:800,color:"white",letterSpacing:-0.5}}>SnacksCheck</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {user
            ? <button onClick={()=>setView("home")} style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>Open app →</button>
            : <button onClick={()=>setShowAuthModal(true)} style={{background:"rgba(255,255,255,0.2)",color:"white",border:"none",borderRadius:16,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>Log in</button>
          }
          <LangPicker light/>
        </div>
      </div>

      {/* Hero */}
      <div style={{background:P.orange,padding:"52px 24px 64px",textAlign:"center"}}>
        <h1 style={{fontSize:42,fontWeight:800,color:"white",lineHeight:1.1,margin:"0 0 14px",letterSpacing:-1}}>{l.hero1}<br/>{l.hero2}</h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,0.85)",maxWidth:420,margin:"0 auto 32px",lineHeight:1.6}}>{l.sub}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>{if(!user){setShowAuthModal(true);}else{setView("rate");}}}
            style={{background:"white",color:P.orangeDark,border:"none",borderRadius:12,padding:"13px 26px",fontSize:15,fontWeight:700,cursor:"pointer"}}>{l.cta1}</button>
          <button onClick={()=>setView("home")}
            style={{background:"rgba(255,255,255,0.2)",color:"white",border:"1.5px solid rgba(255,255,255,0.5)",borderRadius:12,padding:"13px 26px",fontSize:15,fontWeight:700,cursor:"pointer"}}>{l.cta2}</button>
        </div>
      </div>

      {/* Snack strip */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"14px 16px",background:P.orangeLight,borderBottom:`1px solid ${P.border}`}}>
        {[["🥔","Lays Paprika","4.2"],["🍫","Tony's Pretzel","4.8"],["🥜","AH Borrelnoten","3.9"],["🍬","Haribo Goldbären","4.6"],["🍿","Popcorn Zeezout","4.1"],["🍪","Oreo Original","4.4"],["🥔","Pringles Original","4.0"]].map(([icon,name,score],i)=>(
          <div key={i} style={{background:"white",border:`1px solid ${P.border}`,borderRadius:20,padding:"6px 14px",fontSize:13,color:P.muted,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0}}>
            <span>{icon}</span><span style={{color:P.text,fontWeight:500}}>{name}</span><span style={{color:P.orange,fontWeight:700}}>★ {score}</span>
          </div>
        ))}
      </div>

      {/* How it works — 3 blocks */}
      <div style={{padding:"48px 24px",maxWidth:620,margin:"0 auto"}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:P.orange,marginBottom:10}}>{l.how}</div>
        <h2 style={{fontSize:26,fontWeight:800,color:P.text,marginBottom:10,lineHeight:1.2}}>{l.howTitle}</h2>
        <p style={{fontSize:15,color:P.muted,lineHeight:1.7,marginBottom:28}}>{l.howSub}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {icon:"⭐",title:l.f1t,desc:l.f1d,col:"#FFF8E8"},
            {icon:"👥",title:l.f2t,desc:l.f2d,col:"#F0EEFF"},
            {icon:"⚡",title:l.f3t,desc:l.f3d,col:"#E0F7F4"},
          ].map((f,i)=>(
            <div key={i} style={{background:f.col,borderRadius:16,padding:"18px 16px",border:`1px solid ${P.border}`}}>
              <div style={{fontSize:24,marginBottom:10}}>{f.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:P.text,marginBottom:5}}>{f.title}</div>
              <div style={{fontSize:13,color:P.muted,lineHeight:1.5}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Example card with image */}
      <div style={{background:P.orangeLight,padding:"40px 24px",borderTop:`1px solid ${P.border}`,borderBottom:`1px solid ${P.border}`}}>
        <div style={{maxWidth:360,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:P.orange,marginBottom:10}}>{l.example}</div>
          <h2 style={{fontSize:22,fontWeight:800,color:P.text,marginBottom:20}}>{l.exampleTitle}</h2>
          <div style={{background:"white",borderRadius:16,overflow:"hidden",border:`1px solid ${P.border}`,textAlign:"left"}}>
            {/* Fake photo placeholder */}
            <div style={{width:"100%",height:140,background:"linear-gradient(135deg,#FFE4B5 0%,#FFC971 60%,#F5A623 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,position:"relative"}}>
              🥔
              <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.45)",color:"white",fontSize:10,fontWeight:600,borderRadius:6,padding:"2px 7px"}}>📷 community</div>
            </div>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:P.orange}}>Lays</div>
                  <div style={{fontSize:16,fontWeight:700,color:P.text}}>Ovenbaked</div>
                  <div style={{fontSize:13,color:P.muted}}>Paprika</div>
                </div>
                <ScorePill score={4.2}/>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                <span style={{background:P.greenLight,color:P.green,borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:600}}>✓ {l.exPro1}</span>
                <span style={{background:P.greenLight,color:P.green,borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:600}}>✓ {l.exPro2}</span>
                <span style={{background:P.redLight,color:P.red,borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:600}}>✗ {l.exCon1}</span>
              </div>
              <div style={{marginTop:10,fontSize:12,color:P.muted,display:"flex",gap:8}}>
                <span>{t.ratingsCount(3)}</span><span>·</span><span>{t.cats[1]}</span><span>·</span><span>427 kcal/100g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <div style={{padding:"48px 24px",textAlign:"center",maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          {["S","M","J","L"].map((letter,i)=>(
            <div key={i} style={{width:38,height:38,borderRadius:"50%",background:[P.orange,"#6C3FD4","#0AADA6","#E8336B"][i],border:"2.5px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",marginLeft:i>0?-8:0}}>{letter}</div>
          ))}
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:P.text,marginBottom:8}}>{l.joinTitle}</h2>
        <p style={{fontSize:15,color:P.muted,lineHeight:1.6,marginBottom:24}}>{l.joinSub}</p>
        <button onClick={()=>setShowAuthModal(true)}
          style={{background:P.orange,color:"white",border:"none",borderRadius:12,padding:"14px 32px",fontSize:16,fontWeight:700,cursor:"pointer",marginBottom:12,display:"block",width:"100%"}}>
          {l.joinBtn}
        </button>
        <button onClick={()=>setView("home")}
          style={{background:"none",color:P.muted,border:`1.5px solid ${P.border}`,borderRadius:12,padding:"12px 32px",fontSize:15,fontWeight:600,cursor:"pointer",display:"block",width:"100%"}}>
          {l.cta2}
        </button>
      </div>

      {/* Footer */}
      <div style={{background:P.card,borderTop:`1px solid ${P.border}`,padding:"24px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:P.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🍬</div>
          <span style={{fontSize:15,fontWeight:700,color:P.text}}>SnacksCheck</span>
        </div>
        <p style={{fontSize:13,color:P.muted,marginBottom:8}}>{l.footer}</p>
        <div style={{display:"flex",justifyContent:"center",gap:16}}>
          <button onClick={()=>setView("privacy")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:13,fontWeight:600}}>{l.privacy}</button>
          <span style={{color:P.border}}>·</span>
          <button onClick={()=>setView("tos")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:13,fontWeight:600}}>Terms of Service</button>
        </div>
      </div>
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
        {/* Autocomplete search */}
        {(()=>{
          const acResults = acQuery.length >= 2
            ? products.filter(p =>
                p.brand.toLowerCase().includes(acQuery.toLowerCase()) ||
                p.name.toLowerCase().includes(acQuery.toLowerCase()) ||
                p.flavor?.toLowerCase().includes(acQuery.toLowerCase())
              ).slice(0, 6)
            : [];
          const pick = r => {
            setForm(f=>({...f, brand:r.brand, name:r.name, flavor:r.flavor, category:r.category}));
            setAcQuery("");
            setAcOpen(false);
          };
          return (
            <div style={{marginBottom:20,position:"relative"}}>
              <label style={lbl}>🔍 Search existing snacks (optional)</label>
              <input style={{...inp}} placeholder="e.g. Lays, Haribo, Pringles..."
                value={acQuery}
                onChange={e=>{setAcQuery(e.target.value);setAcOpen(true);}}
                onFocus={()=>setAcOpen(true)}
                onBlur={()=>setTimeout(()=>setAcOpen(false),150)}
              />
              {acOpen&&acResults.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:P.card,border:`1.5px solid ${P.orange}`,borderRadius:12,zIndex:50,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",marginTop:4}}>
                  {acResults.map(r=>(
                    <div key={r.id} onMouseDown={()=>pick(r)}
                      style={{padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}
                      onMouseEnter={e=>e.currentTarget.style.background=P.orangeLight}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:P.text}}>{r.brand} {r.name}</div>
                        <div style={{fontSize:12,color:P.muted}}>{r.flavor}</div>
                      </div>
                      <ScorePill score={r.score}/>
                    </div>
                  ))}
                  <div style={{padding:"8px 14px",fontSize:11,color:P.muted,background:P.bg}}>Select to auto-fill the form below</div>
                </div>
              )}
              {acQuery.length>=2&&acResults.length===0&&(
                <div style={{fontSize:12,color:P.muted,marginTop:6}}>No match found — fill in the form below to add it.</div>
              )}
            </div>
          );
        })()}
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
              : <ProductInfoCard info={productInfo} lang={lang}/>
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
        <label style={lbl}>📍 City / Country <span style={{textTransform:"none",fontWeight:400,letterSpacing:0}}>(optional)</span></label>
        <input style={{...inp,marginBottom:16}} placeholder="e.g. Amsterdam, Netherlands" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
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
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e=>{
                const file=e.target.files[0]; if(!file) return;
                const allowed=["image/jpeg","image/png","image/webp"];
                if(!allowed.includes(file.type)){alert("Only JPEG, PNG, or WebP images are allowed.");e.target.value="";return;}
                if(file.size>5*1024*1024){alert("Image must be under 5 MB.");e.target.value="";return;}
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
    const detailInfo=products.find(p=>p.productCode===first.productCode)?.productInfo||pRatings.find(r=>r.productInfo)?.productInfo||null;
    return (
      <div style={{minHeight:"100vh",background:P.bg,fontFamily:"system-ui,sans-serif"}}>
        <Header subtitle={first.brand}/>
        {authModal}
        <div style={{padding:20,maxWidth:520,margin:"0 auto"}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:P.orange,cursor:"pointer",fontSize:14,fontWeight:700,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>{t.back}</button>
          <div style={{background:P.card,borderRadius:16,border:`1.5px solid ${P.border}`,padding:20,marginBottom:20}}>
            <span style={{background:P.orangeLight,color:P.orangeDark,fontSize:11,fontWeight:700,borderRadius:20,padding:"2px 8px"}}>{CAT_ICONS[catIdx]} {t.cats[catIdx]}</span>
            <h1 style={{fontSize:24,fontWeight:800,margin:"10px 0 4px",color:P.text,lineHeight:1.1}}>{first.brand} {first.name.toLowerCase().startsWith(first.brand.toLowerCase())?first.name.slice(first.brand.length).trim():first.name}</h1>
            {first.flavor&&<div style={{color:P.muted,fontSize:14,marginBottom:14}}>{first.flavor}</div>}
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <ScorePill score={parseFloat(a.toFixed(1))} size="lg"/>
              <Stars value={Math.round(a)} size={22}/>
              <span style={{color:P.muted,fontSize:13}}>{t.ratingsCount(pRatings.length)}</span>
            </div>
          </div>
          {detailInfo&&<div style={{marginBottom:20}}><ProductInfoCard info={detailInfo} lang={lang}/></div>}
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
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:P.muted}}>{timeAgo(r.timestamp)}</div>
                      {r.location&&<div style={{fontSize:11,color:P.muted}}>📍 {r.location}</div>}
                    </div>
                    {isMe&&<button onClick={()=>handleDelete(r.id)} style={{background:P.redLight,color:P.red,border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>}
                    {!isMe&&<a href={`mailto:privacy@snackscheck.com?subject=Report rating&body=Rating ID: ${r.id}%0ABrand: ${r.brand} ${r.name}%0ARater: ${r.rater}%0AReason: (please describe the issue)`} style={{background:"#FFF5F5",color:P.red,border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}} title="Report this rating">🚩</a>}
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
          <div style={{width:"100%"}}>
            <div style={{...lbl,marginBottom:4}}>Hide if contains</div>
            <div style={{fontSize:11,color:P.muted,marginBottom:8}}>Selected allergens → product hidden from results</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["milk","gluten","eggs","nuts","peanuts","soy","fish","shellfish","sesame"].map(a=>{
                const active=avoidAllergens.includes(a);
                return (
                  <button key={a} onClick={()=>setAvoidAllergens(prev=>active?prev.filter(x=>x!==a):[...prev,a])}
                    style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${active?"#EF4444":P.border}`,background:active?"#FFF0F0":"white",color:active?"#EF4444":P.muted,fontSize:12,fontWeight:active?700:400,cursor:"pointer",transition:"all .15s"}}>
                    {active?"✕ ":""}{a}
                  </button>
                );
              })}
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
          {filterCount>0&&(
            <div style={{display:"flex",alignItems:"flex-end"}}>
              <button onClick={()=>{setMinScore(0);setFilterBrand("");setFilterFlavor("");setMaxCalories(0);setMinProtein(0);setMinFibre(0);setAvoidAllergens([]);}}
                style={{padding:"7px 12px",borderRadius:10,border:`1.5px solid ${P.border}`,background:P.bg,color:P.muted,cursor:"pointer",fontSize:13}}>
                {t.reset}
              </button>
            </div>
          )}
        </div>
      )}
      <div style={{padding:"6px 16px",fontSize:11,color:P.muted,background:P.bg,letterSpacing:.3}}>
        {tab==="all"?`${t.products(codes.length)} · ${t.sorts[SORTS_IDS.indexOf(sortBy)]}`:t.myRatingsCount(myRatings.length,userName||"...")}
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
              const firstImage=list.find(r=>r.image)?.image||null;
              // Strip brand from start of name to avoid "Pringles Pringles chips"
              const brandLower=first.brand.toLowerCase();
              const displayName=first.name.toLowerCase().startsWith(brandLower)
                ? first.name.slice(first.brand.length).trim()
                : first.name;
              return (
                <div key={code} onClick={()=>{setSelProd(code);setView("detail");}}
                  style={{background:P.card,borderRadius:16,overflow:"hidden",border:`1.5px solid ${P.border}`,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=P.orange;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=P.border;}}>
                  {firstImage
                    ? <img src={firstImage} alt={first.name} style={{width:"100%",height:100,objectFit:"cover",display:"block"}}/>
                    : <div style={{width:"100%",height:100,background:P.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{CAT_ICONS[catIdx]}</div>
                  }
                  <div style={{padding:12}}>
                    <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,marginBottom:1,color:P.text}}>{first.brand}</div>
                    <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,marginBottom:1,color:P.text}}>{displayName}</div>
                    <div style={{fontSize:12,color:P.muted,marginBottom:8}}>{first.flavor}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <ScorePill score={parseFloat(a.toFixed(1))}/>
                      <span style={{fontSize:11,color:P.muted}}>{list.length}×</span>
                    </div>
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
              {[{label:t.rated,val:myRatings.length},{label:t.avgScore,val:avg(myRatings).toFixed(1)+" ★"},{label:t.categories,val:[...new Set(myRatings.map(r=>r.category))].length}].map((s,i)=>(
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
          style={{width:54,height:54,borderRadius:"50%",background:P.orange,color:"white",border:"none",fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(245,166,35,0.45)"}}>+</button>
      </div>
    </div>
  );
}
