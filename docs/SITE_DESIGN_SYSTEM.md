# POELIO — Référentiel de conception du site

Date de départ : 13 octobre 2026. Ce référentiel retrace la direction initiale du site et son évolution. Pour l'état du code, du site public et des validations humaines, voir [l'état actuel](CURRENT_STATUS.md).

## Intention

POELIO est un atelier littéraire interactif. L’utilisateur découvre une œuvre, formule une lecture, manipule une contrainte, compare des textes existants, écrit et revient à sa première interprétation. La littérature occupe la première place. Les faits mathématiques et les lectures critiques restent distincts.

## Architecture publique

- `/` : accueil.
- `/?view=works` : catalogue des œuvres.
- `/?view=atelier` : présentation de deux pratiques et accès aux parcours.
- `/?view=about` : démarche, provenance, vie privée, droits et typographie.
- `/?work=register` : Le Registre des clefs.
- `/?work=permutation` : Les Quatre Témoins.
- `/?review=register|permutation` et `/?companion=register|permutation` : anciennes lectures indépendantes préservées.
- `/facilitator.html` : guide imprimable.

Les paramètres d’URL sont délibérés : GitHub Pages sert un document HTML statique avec une règle de publication stricte. Des chemins plus lisibles demanderont une stratégie de routage et de rechargement fiable. Ne pas prétendre qu’ils existent déjà.

## Identité visuelle

- Une seule famille : **Source Sans 3**, variable, locale, depuis les fichiers officiels Adobe, SIL OFL 1.1.
- Palette de gris stricte : fond blanc, texte proche du noir, traits gris, surbrillance sans couleur.
- Absence d’illustrations, d’ombres, de dégradés, de slogans, de badges décoratifs ou de rendu génératif.
- Grille d’espacement 8/16/24/32/48/64 px ; marges lisibles et largeur de lecture restreinte.
- Une seule barre de navigation pour les pages principales. À l’intérieur d’une œuvre, les outils secondaires sont séparés du texte.
- L’interface française et l’interface anglaise sont relues comme deux rédactions distinctes.
- Sous-titres et indications uniquement si une action ou un contenu concret les justifie.

## État constaté avant travaux

- La racine ouvrait directement une œuvre sans introduction.
- Deux familles typographiques et plusieurs couleurs étaient en usage.
- Les menus déroulants dominaient l’exploration ; aucune manipulation directe des quatre fragments.
- Les pages documentaires et le guide avaient des systèmes visuels différents.
- La distribution hors-ligne contrôlait un jeu de cinq fichiers ; la police locale exige une extension explicite de ce contrôle.

## Phases de construction

1. **Fondation** : navigation publique, accueil, catalogue, Atelier, À propos, typographie et monochromie homogènes, préservation des liens existants.
2. **Le Registre des clefs** : manipuler huit positions, annulation, états valides/invalides, distinction des textes publiés, comparateur responsive.
3. **Les Quatre Témoins** : déplacer directement les fragments, commandes clavier/tactiles de repli, états cohérents, prévisualisation et comparaison.
4. **Écriture** : outils de composition et export, autonomie de l’utilisateur, prévention de perte de données.
5. **Harmonisation** : lectures indépendantes, guide, contenus légaux, responsive, accessibilité et revue éditoriale.
6. **Évaluation** : tests techniques, inspection des captures, essais avec des lecteurs novices, suivi des défauts et revue avant fusion.

## Conditions de réception de la fondation

- L’accueil explique la finalité et présente les deux œuvres en moins de deux actions.
- La navigation conserve son sens sur ordinateur et à 320 px.
- Les deux œuvres restent accessibles directement et gardent leurs passages approuvés inchangés.
- Les anciens liens de lecture indépendante restent valides.
- Une police locale unique sur toutes les pages, avec sa licence distribuée.
- Tous les actifs restent explicitement autorisés dans la distribution, le service worker et l’audit.
- Tests automatiques de navigation, clavier, contraste, débordement, confidentialité et publication sur racine et sous-chemin.

Un contrôle automatisé ne remplace pas une évaluation esthétique humaine ni des essais réels avec lecteurs.
