# POELIO | Exécution manuelle des vérifications d'accessibilité

**Statut :** instructions et critères d'observation ; **aucun essai avec NVDA, VoiceOver ou un participant extérieur n'est attesté ici**. Ce protocole complète [l'acceptation technique](ACCESSIBILITY_ACCEPTANCE.md) sans la remplacer.

## Préparation

Noter l'URL, le commit déployé, le navigateur, la largeur de fenêtre, le réglage de zoom et la technologie d'assistance avant chaque essai. Partir d'un onglet vierge pour la lecture initiale. Employer exclusivement les deux œuvres publiques et une phrase de test fictive sans information personnelle. Désactiver l'utilisation d'une véritable création d'autrui comme chaîne de test.

Les résultats de Playwright et d'axe documentent certaines propriétés automatisables. Ils ne vérifient ni les annonces réelles d'un lecteur d'écran, ni le confort de lecture, ni l'accès dans les conditions propres aux personnes concernées.

## A. Parcours au clavier uniquement

Avec Tab, Shift+Tab, Entrée, Espace et les flèches, sans souris :

1. Entrer dans la page par le lien d'évitement et vérifier que le focus conduit au texte.
2. Parcourir Lire → Questionner → Explorer → Comparer → Inventer → Revenir, puis revenir à Explorer et à une autre œuvre.
3. Sur écran étroit, utiliser le sélecteur natif des six étapes ; sur écran large, les six commandes typographiques.
4. Modifier un des huit jours du Registre, puis annuler et rétablir ; vérifier l'annonce du diagnostic et la conservation de la configuration.
5. Dans les Quatre Témoins, déplacer les fragments avec les commandes clavier ; imposer et retirer la règle de précédence ; écouter l'annonce d'un déplacement refusé.
6. Ouvrir la note facultative de première lecture ; accéder au comparateur ; revenir à l'exploration ; vérifier que le focus et les choix antérieurs sont préservés.
7. Rédiger une **phrase fictive de test**, exporter TXT puis JSON, fermer le panneau et vérifier le retour du focus. Pour les imports, utiliser exclusivement un fichier fictif préparé à partir du site, sans aucun texte privé.
8. Ouvrir les options, essayer la confirmation de recommencement **sans exécuter de perte de données non souhaitée**, puis vérifier les liens vers les documents imprimables.

Consigner toute perte de focus, tout piège clavier et toute fonction dépendant exclusivement d'un geste.

## B. Parcours avec lecteur d'écran

Pour **NVDA + Chrome sous Windows** et **VoiceOver + Safari sur appareil Apple**, exécuter séparément le parcours ci-dessus. Vérifier en particulier :

- Le titre de l'œuvre, la hiérarchie des titres et l'ordre de lecture.
- L'annonce de l'étape active et du sélecteur sur mobile.
- L'annonce des champs facultatifs, états de contraintes, annulations, résultats et messages d'erreur.
- Les passages littéraires en français, même si l'interface affiche des commandes en anglais.
- La distinction audible entre le texte réellement rédigé et les configurations calculées sans prose.
- Le retour du focus à la région principale du texte et à la commande ayant ouvert un panneau.
- Le parcours linéaire des deux colonnes de comparaison sur mobile.
- L'accès aux exports, y compris l'annonce intelligible des téléchargements par le navigateur et le système.

Ne pas déclarer une technologie testée sans nommer sa version, l'environnement et le résultat de l'essai réel. Les émissions de parole et l'expérience de navigation ne sont pas inférables à partir du DOM seul.

## C. Zoom et contraste

Essayer séparément les largeurs de 320, 375 et 390 pixels CSS, puis le zoom navigateur à 200 % et 400 %, en modes portrait et paysage lorsque disponibles. Tester l'espacement du texte, le mouvement réduit et le mode de contraste forcé ; vérifier le texte long, les accents et les caractères bidirectionnels dans un brouillon fictif.

Vérifier que les actions restent utilisables, qu'aucun panneau obligatoire n'est occulté et que la lecture ne demande pas un défilement horizontal du document. La perte de richesse d'une comparaison côte à côte est acceptable si l'ordre de lecture séquentiel est clair et annoncé.

## D. Rapport de défaut et décision

Relever chaque incident dans la [fiche C](READER_FIELD_RECORDS.md) avec un scénario minimal **sans texte de participant**. Prévoir une priorité P0/P1/P2/P3, un responsable de correction et un test de régression pour les anomalies reproductibles.

Une livraison fonctionnelle en CI n'équivaut pas à une réception WCAG 2.2 AA. Les scénarios ci-dessus sont **à réaliser** avant tout constat d'accessibilité humaine. En cas d'obstacle majeur de lecture ou de perte d'écriture, corriger avant une diffusion facilitée à plus grande échelle.
