# POELIO | État du dépôt et passage aux vérifications humaines

**Revue documentaire : 14 octobre 2026.** Cette page est un point d'orientation, pas une certification. L'état de `main` peut évoluer : vérifier le [dernier commit](https://github.com/fraware/POELIO/commits/main) et [les exécutions CI](https://github.com/fraware/POELIO/actions) avant toute affirmation sur la version servie.

## Deux objets de publication distincts

- **Site public évolutif :** [POELIO sur GitHub Pages](https://fraware.github.io/POELIO/). Le workflow `Publish public reading preview` dépend de la CI verte du dernier commit de `main`, reconstruit les seuls huit fichiers autorisés et compare leurs **octets HTTPS réellement servis** à l'audit de construction. La [procédure de déploiement](GITHUB_PAGES.md) explicite les limites de cette preuve.
- **Préversion immuable :** [`v0.2.0-rc.3`](https://github.com/fraware/POELIO/releases/tag/v0.2.0-rc.3), publiée le 14 octobre 2026 depuis `171c95bd91f0c79e2d8270b86e065f0609b8a9a9`. Elle porte le statut **prerelease**, sans artefact additionnel joint ; les archives source standard générées par GitHub ne comprennent que le contenu public du dépôt. Les correctifs ultérieurs de `main` n'altèrent **pas** cette préversion. Les fichiers `package.json` indiquent toujours la base de version `0.2.0-rc.3` ; ce numéro seul n'identifie pas les derniers correctifs.

## Ce qui est techniquement contrôlé

| Domaine | État vérifiable | Limite |
|---|---|---|
| Littérature publique | Deux œuvres d'enseignement explicitement autorisées et épinglées | Aucun droit supplémentaire sur une œuvre privée |
| Modèles finis | 256 affectations et 14 réparations minimales ; 24 permutations et 12 ordres sous condition | Aucun résultat sur la qualité, le sens ou l'intention littéraire |
| Réalisations écrites | Deux textes rédigés pour le Registre ; quatre fragments identiques déplacés pour les Témoins | Les douze autres réparations n'ont pas de prose |
| Lecture et interaction | Six étapes bilingues, comparaison, annulation, commandes tactiles/clavier, essais Playwright | Pas de validation par des lecteurs novices |
| Réponses personnelles | Stockage de session par onglet, repli en mémoire, export TXT / sauvegarde JSON v1 explicites | Pas de chiffrement ni d'effacement garanti des copies d'onglets ou fichiers téléchargés |
| Diffusion | Audit exact des fichiers, dépendances verrouillées, contrôle du serveur Pages et tests hors ligne | Pas d'audit humain de chaque appareil ; entêtes HTTP de sécurité incomplets sur GitHub Pages |
| Accessibilité | Régressions clavier, mobile, axe et contraste forcé automatisées | WCAG 2.2 AA non certifié, NVDA et VoiceOver réels non évalués |
| Littérature / enseignement | Protocole indépendant, comparateur statique et fiches de terrain préparés | Aucun avis extérieur, atelier, effet pédagogique ou consentement humain enregistré |

Les composants du navigateur ne génèrent pas de prose littéraire à partir de modèles, n'enregistrent pas de réponses sur un serveur et n'intègrent pas les manuscrits privés. L'application ne revendique aucune affiliation à l'Oulipo. Le code et les textes littéraires publics ont des [régimes de droits distincts](../LICENSE-CONTENT.md).

## Documentation de référence, par responsabilité

| Question | Référence |
|---|---|
| Vision, six étapes, frontières éditoriales | [Produit](PRODUCT_SPEC.md) et [direction artistique](ART_DIRECTION.md) |
| Architecture et règles de publication | [Architecture](ARCHITECTURE.md), [registre de contenu](PUBLIC_CONTENT_CONTRACT.md), [intégrité](CONTENT_INTEGRITY.md) |
| Publication, droits et reproduction des tests | [Déploiement](GITHUB_PAGES.md), [audit technique](RELEASE_AND_CANDIDATE_PREFLIGHT.md), [publication GitHub](GITHUB_RELEASE_PLAYBOOK.md) |
| Stockage, réutilisation des brouillons et menace de copie | [Confidentialité](SECURITY_PRIVACY_ACCEPTANCE.md), [sauvegardes](PORTABLE_READER_BACKUPS.md) |
| Lecture indépendante et observations | [Kit de terrain](INDEPENDENT_READER_FIELD_KIT.md), [fiches vierges](READER_FIELD_RECORDS.md) |
| Accessibilité et ateliers | [Vérifications humaines](ACCESSIBILITY_FIELD_RUNBOOK.md), [séance de 60 min](WORKSHOP_PILOT.md), [séance de 15 min](WORKSHOP_15_MIN.md) |

La [table des matières](INDEX.md) donne accès à l'ensemble des documents actifs, ainsi qu'aux notes de versions historiques.

## Vérifications humaines encore nécessaires

Les éléments suivants doivent être **réalisés**, non pré-cochés : critiques littéraires indépendantes des textes avant et après révélation de leurs règles ; observations de nouveaux lecteurs et réception des manipulations ; tests clavier, NVDA/Chrome, VoiceOver/Safari, zoom 200–400 %, impression et appareils réels ; vérification éditoriale des contraintes et des droits avant toute nouvelle œuvre ; décisions de consentement, conservation et examen institutionnel si une étude humaine est conduite.

Les issues [#3](https://github.com/fraware/POELIO/issues/3), [#20](https://github.com/fraware/POELIO/issues/20), [#35](https://github.com/fraware/POELIO/issues/35), [#36](https://github.com/fraware/POELIO/issues/36), [#37](https://github.com/fraware/POELIO/issues/37) et [#46](https://github.com/fraware/POELIO/issues/46) suivent ces critères. Les livraisons informatiques associées ne suffisent pas à fermer leurs critères de réception humaine.

## Protocole de transmission au vérificateur extérieur

Communiquer seulement les [liens de première lecture](INDEPENDENT_READER_FIELD_KIT.md) **avant** d'expliquer une contrainte. Le lecteur peut refuser l'évaluation ou la collecte de réponses. Après la critique initiale, montrer séparément le compagnon statique et le parcours interactif. Pour la réception d'accessibilité, choisir une phrase fictive, sans texte personnel ni manuscrit privé. Conserver les résultats seulement selon les permissions préalablement définies, hors du dépôt GitHub, du cache public et des journaux CI.

**Règle de décision :** un test vert ou une préversion publiée confirme un état technique délimité. La qualité de lecture, la compréhension, l'accessibilité humaine et la légitimité d'une publication nouvelle demandent chacune une preuve différente.
