# Romuald Crochat · Portfolio

Site personnel de Romuald Crochat : marketing et communication de l'intelligence artificielle, projets, parcours et contact.

## Contenu

- **À propos** : présentation et domaines d'expertise (IA et data, marketing et communication, management, transmission).
- **Projets** : réalisations filtrables par thème (IA, marketing et communication, management).
- **Parcours** : expériences, formations et engagement comme jury du titre professionnel Concepteur Designer UI.
- **Compétences et certifications.**
- **Contact.**

## Technique

Site statique, sans framework ni étape de build :

```
index.html      structure et contenu
css/style.css   mise en page, thème clair et sombre
js/main.js      animations et filtres des projets
```

- Polices : Bricolage Grotesque, Instrument Sans et JetBrains Mono (Google Fonts).
- Animation de fond : carte de courbes de niveau générée en temps réel sur un canvas (bruit de valeur et marching squares).
- Accessibilité : navigation au clavier, respect du réglage « réduire les animations » du système, thème clair et sombre automatique.
- Responsive, du mobile au grand écran.

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```
python3 -m http.server 8000
```

puis aller sur http://localhost:8000.

## Mise en ligne

Publié avec GitHub Pages depuis la branche `main`, à la racine du dépôt.
