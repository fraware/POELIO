# POELIO | Plan d'impact et de réutilisation

**État :** feuille de route proposée, octobre 2026. Elle définit des choix, des dépendances et des critères de réception. Elle ne présente aucun atelier, avis extérieur ou résultat pédagogique comme déjà réalisé.

**Point de départ vérifié :** site GitHub Pages public, deux œuvres publiques approuvées, six étapes par œuvre, modèles finis testés, registre de contenus contrôlé, guide de séance, lectures indépendantes et comparateurs statiques. L'expérience utilisateur n'a pas encore été évaluée indépendamment.

## 1. Étoile polaire

> Donner aux lecteurs et aux animateurs un environnement littéraire qu'ils prennent plaisir à explorer, puis leur permettre de réutiliser les expériences, les outils et les méthodes dans d'autres contextes, sans dépendance au créateur du projet.

Trois formes de réutilisation doivent guider les choix :

1. **Usage individuel :** un lecteur découvre, manipule, compare, écrit et conserve volontairement son travail, sur mobile ou ordinateur.
2. **Réutilisation logicielle :** l'interaction et la validation sont séparées de la prose et des deux modèles particuliers, puis documentées et testées dans des exemples synthétiques.
3. **Transmission pédagogique et critique :** un tiers mène une séance avec le guide, les exercices, les documents imprimables et les protocoles de retour d'expérience, sans solliciter le développeur.

### Ce que POELIO ne fera pas dans cette phase

Aucun compte, moteur de génération de prose, classement des textes, stockage distant des réponses, télémétrie passive, place de marché d'œuvres ni insertion automatique de manuscrits. Aucun résultat mathématique ne sera présenté comme preuve d'une interprétation ou d'une qualité littéraire.

La publication de **La Relève** est menée séparément. Les archives et manuscrits de cette œuvre ne rejoignent pas le site, le dépôt, les jeux de tests, les archives CI ou les démonstrations POELIO par défaut. Toute intégration future nécessiterait une nouvelle décision explicite sur les droits, la publication et l'intégrité des évaluations.

## 2. Ordre de réalisation

Les fenêtres sont des **objectifs de planification**, à ajuster aux problèmes révélés par les essais et aux capacités disponibles. Les étapes doivent franchir leurs critères d'acceptation avant une diffusion plus large.

| Fenêtre cible | Chantier | Livraison réutilisable | Preuve de réception |
|---|---|---|---|
| 14–27 octobre | **A. Noyau de manipulations** | Opérations typées et pures sur des ID stables, annulation/refaire, validation de contraintes, tests synthétiques | Contrat d'API, tests de propriétés et de régression, CI complète |
| 28 octobre–10 novembre | **B. Les Quatre Témoins** | Plateau de fragments tactile/clavier, aperçu immédiatement actualisé, comparaison partagée | Quatre fragments inchangés ; 24 permutations et 12 satisfaisant la règle ; essais de cinq lecteurs novices |
| 11–24 novembre | **C. Le Registre des clefs** | Atelier visuel de huit jours et comparateur commun, fondés sur le modèle existant | 256 états et 14 réparations toujours démontrés ; seulement deux états accompagnés d'une prose rédigée |
| 11 novembre–1 décembre (en parallèle) | **D. Brouillons portables** | Export lisible, format versionné strict, import volontaire et validé, reprise explicite | Tests des allers-retours et erreurs, aucune transmission des textes, pas de perte à la navigation |
| 25 novembre–8 décembre | **E. Instruments pédagogiques** | Kit de séance 15/60 minutes, fiche animateur, fiches imprimables, grille d'observation et information/consentement distincts | Un animateur extérieur prépare la séance sans explication technique |
| 1–15 décembre | **F. Validation réelle** | Observations de 12–15 nouveaux lecteurs, trois avis littéraires indépendants, puis 2–3 ateliers pilotes | Rapport de défauts, limites, désaccords et modifications apportées ; aucun effet pédagogique causal revendiqué |
| 15 décembre–janvier 2027 | **G. Transfert et diffusion** | Version stable identifiée, documentation d'extension, exemple fictif de nouvelle œuvre, paquet de démonstration autonome | Une personne extérieure réutilise le logiciel ou le kit dans un contexte nouveau |

**Dépendances :** A → B → C ; B/C → D ; B/C et retours d'usage → E/F ; E/F → G. Le travail de recrutement, de revue éditoriale et de préparation des documents pédagogiques peut démarrer pendant les chantiers techniques, sans présenter les essais comme accomplis.

## 3. Produits logiciels réutilisables

### A. Contrat d'interaction, commun sans généralisation excessive

**Ticket :** [#34](https://github.com/fraware/POELIO/issues/34).

Livrer des fonctions pures, documentées et testées pour la validation d'une liste d'ID, le déplacement d'un élément, l'historique borné et la révocation explicite d'un changement invalide. Réutiliser la même discipline d'état, d'annulation et d'annonce d'action dans les deux œuvres.

Les faits mathématiques proviennent exclusivement de `experience/src/permutation.ts` et de `src/model.ts`. Une bibliothèque de manipulation ne redéfinit jamais ces modèles ni ne modifie les passages d'origine.

**Critères :** état déterministe, aucune disparition/duplication d'ID, aucun changement de configuration silencieux lors de l'activation d'une contrainte, invariants testés sur données synthétiques, aucune nouvelle dépendance non justifiée.

### B. Les Quatre Témoins, première expérience exemplaire

**Ticket :** [#35](https://github.com/fraware/POELIO/issues/35).

Créer un composant `FragmentBoard` à partir de fragments préattribués, consultés en lecture seule, et d'un ordre contrôlé par le parent. L'utilisateur déplace une carte à la souris et au toucher, ou utilise des commandes visibles/au clavier. L'aperçu est recomposé directement par `publicWorks.permutation.passages(order)`, sans mutation du texte.

Le panneau de comparaison permet de lire deux ordres du **même** ensemble de phrases, avec une présentation séquentielle sur mobile. Les intitulés indiquent clairement le statut du texte et la portée du résultat formel.

**Critères :** drag, touch, commandes sans geste, annuler/refaire et réinitialiser ; annonce accessible du mouvement ; écran à 320 px, zoom, mouvement réduit ; 24/12 ordres testés ; anciennes URL et étapes intactes ; conservation locale des réponses.

### C. Le Registre des clefs, seconde réalisation du dispositif

**Ticket :** [#36](https://github.com/fraware/POELIO/issues/36).

Mettre en scène les huit positions et les contraintes de récurrence/alternance. L'utilisateur teste des choix, voit les transitions et comprend la contradiction. Afficher le périmètre du calcul et la distinction entre **quatorze réparations calculées** et **deux réalisations littéraires écrites**. Aucun passage inventé pour les douze autres cas.

**Critères :** tests exhaustifs des 256 arrangements, des 14 minimums et de leurs liens aux deux réalisations ; interaction accessible ; aucune mutation des textes épinglés.

### D. Travail conservé et transférable

**Ticket :** [#37](https://github.com/fraware/POELIO/issues/37).

Formaliser un export compatible entre versions : œuvre, version du contenu, règle personnelle, configuration choisie, première lecture, écriture et relecture. Les exports existants `.txt` restent utilisables. Un éventuel `.json` versionné est validé strictement à l'import, avec choix explicite entre remplacer ou garder les brouillons courants. Ne pas enregistrer les réponses dans le cache hors ligne destiné aux ressources publiques.

**Critères :** tests Unicode, import invalide, limite de taille, conflit de version, conflits entre travaux et suppression sur appareil partagé ; aucune transmission réseau ; avertissement fiable sur les limites de `sessionStorage`.

### G. Extension contrôlée

**Ticket de référence :** [#2](https://github.com/fraware/POELIO/issues/2).

Ne construire la documentation d'extension qu'une fois deux interactions convaincantes stabilisées. La réutilisation implique un **adaptateur de contenu** documenté : source attribuée, règles, états admissibles, liens éventuels vers des textes effectivement écrits, statut des résultats et décision éditoriale sur les droits.

Un exemple **purement synthétique, réservé aux tests**, montrera le contrat de développement. Aucune soumission d'œuvre depuis le navigateur ni import arbitraire n'entrera dans le registre public. Toute nouvelle œuvre passe par revue, source épinglée et allowlist mise à jour explicitement.

## 4. Instruments pédagogiques et critique littéraire

**Ticket de référence :** [#3](https://github.com/fraware/POELIO/issues/3).

Ne pas créer de protocoles concurrents. Réutiliser et réviser les documents existants :
- `docs/WORKSHOP_PILOT.md` pour le déroulement pédagogique ;
- `docs/EDITORIAL_REVIEW_PROTOCOL.md` pour la première lecture non amorcée ;
- `docs/STATIC_COMPARISON_PROTOCOL.md` pour la condition non interactive ;
- `docs/ACCESSIBILITY_ACCEPTANCE.md` pour les validations réelles ;
- `experience/public/facilitator.html` pour la fiche imprimable.

**Kit à produire :** une fiche « animer en 15 minutes », une séance de 60 minutes, des consignes de lecture sans dévoilement préalable, une grille d'observation, une fiche de retour facultatif et un journal vierge de séance. Versions source modifiables (Markdown/HTML) et fiches imprimables. Les modèles sont diffusés sous les droits adaptés ; les extraits littéraires intégrés suivent `LICENSE-CONTENT.md`.

**Pilote en deux temps :**
1. 12–15 essais individuels avec lecteurs qui ne connaissent pas l'interface. Observer les actions et obstacles, sans collecter leurs textes automatiquement. Séparer facilité d'usage, compréhension formelle, intérêt esthétique et production écrite.
2. Deux ou trois ateliers pilotes, idéalement dont au moins un animé par un tiers. Recrutement et conservation des données soumis à l'information, au consentement et aux règles institutionnelles applicables ; pas d'enregistrement de réponses nominatives dans Git.

**Revue critique :** trois avis indépendants, idéalement écrivain de littérature expérimentale, formateur à l'écriture et spécialiste des lettres numériques. Leur première exposition est centrée sur la prose avant dévoilement des mécanismes. Consigner les désaccords et les critiques concrètes. Les critères éditoriaux ne deviennent pas un score automatisé de qualité littéraire.

Les résultats d'ateliers d'observation ne doivent pas être présentés comme démontrant un avantage causal. Une étude comparative ultérieure devrait utiliser le compagnon statique existant et un protocole approuvé séparément.

## 5. Mesures et seuils de décision

Ces seuils sont des **objectifs indicatifs**, pas des preuves déjà obtenues.

| Domaine | Mesure | Seuil de travail | Conséquence en cas d'échec |
|---|---|---|---|
| Utilisabilité | Réussite sans aide de la réorganisation de fragments | ≥ 80 % des 12–15 lecteurs novices | Revoir la manipulation avant d'élargir le catalogue |
| Compréhension | Description correcte d'une contrainte et de sa limite | ≥ 70 % lors des essais, codage annoncé à l'avance | Réécrire consignes et résultats ; ne pas conclure à l'effet pédagogique |
| Accessibilité | Parcours clavier/touch sans blocage et revue NVDA/VoiceOver réelle | Aucun obstacle critique non résolu | Bloquer l'élargissement de diffusion |
| Réutilisation pédagogique | Ateliers réellement animés par un tiers | Au moins deux pilotes, dont un sans aide du concepteur | Simplifier le guide et les composants |
| Réutilisation technique | Utilisation du contrat par deux dispositifs existants et un exemple synthétique | Documentation, tests et exemple opérationnels | Réduire les abstractions inutiles |
| Éditorial | Trois critiques indépendantes sur les deux œuvres | Critiques argumentées et décisions de révision documentées | Réviser les œuvres/activités avant communication |
| Confiance | Fuites de brouillons ou de manuscrits non autorisés | Zéro dans les vérifications et tests | Bloquer immédiatement la publication |

Les nombres d'étoiles GitHub, visites et clics peuvent renseigner sur la diffusion, sans constituer des preuves d'apprentissage ou de qualité.

## 6. Règles de validation pour chaque PR

Une PR ne sera fusionnée qu'avec :

1. **But utilisateur** : un problème observable, un scénario concret et un résultat attendu.
2. **Réutilisation** : un composant ou un document exploitable ailleurs, ou une justification explicite du choix spécialisé.
3. **Exactitude** : assertions formelles limitées à ce qui est calculé ; prose originale inchangée ou contrôlée avec autorisation.
4. **Intégrité** : aucune atteinte aux protections des sources, au registre public, aux manifests, à l'inventaire des actifs ou aux droits.
5. **Confidentialité** : aucun compte, réseau de données personnelles, collecte cachée ou insertion de brouillons dans les caches publics.
6. **Accessibilité** : tests automatiques et tests manuels adaptés à l'interaction ; 320 px et clavier.
7. **Publication** : CI racine et sous-chemin, hors ligne, revue des captures, notes de version précisant les limitations.

L'acceptation d'une PR technique ne vaut ni homologation WCAG 2.2 AA, ni approbation critique, ni démonstration d'efficacité pédagogique.

## 7. Premier sprint : critères de sortie

**Sprint A, cible 14–27 octobre 2026 :**
- Contrat minimal et fonctions pures validées ;
- tests de permutation/contrainte, invariants et historique réversible ;
- composant de manipulation sous démonstration synthétique ou prototypé sans toucher aux œuvres ;
- description documentée de la commande clavier/tactile ;
- spécification de l'interface de comparaison et des données à exporter.

**Arrêt obligatoire** si les primitives altèrent les textes, contredisent les modèles, rendent l'usage clavier impossible ou affaiblissent les protections de publication. Les améliorations superficielles d'interface ne justifient pas une telle régression.

## 8. Pilotage du travail

Sources de vérité : tickets GitHub [#34](https://github.com/fraware/POELIO/issues/34), [#35](https://github.com/fraware/POELIO/issues/35), [#36](https://github.com/fraware/POELIO/issues/36), [#37](https://github.com/fraware/POELIO/issues/37), et tickets existants [#3](https://github.com/fraware/POELIO/issues/3), [#2](https://github.com/fraware/POELIO/issues/2).

Une seule PR fonctionnelle à la fois sur le chemin critique A → B → C. Chaque PR contient tests, captures de régression et décision de publication. Des documents de facilitation et de revue peuvent progresser en parallèle. Une revue de sprint renseigne : fonctionnalité livrée, problèmes ouverts, intérêt observé, réutilisation vérifiée, choix pour le prochain sprint.

**Décision suivante : commencer #34, puis faire de #35 notre référence d'expérience interactive.**
