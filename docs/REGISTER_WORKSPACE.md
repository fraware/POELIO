# Atelier des huit jours : interaction et preuve

**Périmètre** : modèle fini de \`src/model.ts\`, démonstration littéraire approuvée \`experience/src/episode.ts\`. Aucune source privée importée. Ce document décrit le nouveau poste d'exploration du *Registre des clefs* ; il ne constitue ni une preuve Lean ni une évaluation de lecteurs.

## Un atelier qui expose aussi les erreurs

Les huit positions désignent deux affectations abstraites (A et B). L'interface les présente sous les noms Mira et Noor. Dans la phase **Explorer**, le lecteur change librement l'affectation d'un jour en activant sa commande, au clavier ou au toucher. Il observe :

- **Récurrence** : la première et la dernière positions correspondent-elles ?
- **Relais répétés** : combien de paires adjacentes ont la même affectation et lesquelles ?
- **Réparation minimale** : la récurrence est-elle satisfaite avec exactement **une** répétition ?
- **Réalisation rédigée** : une des deux sources publiées est-elle effectivement liée à l'état courant ?

Ces affirmations proviennent exclusivement des fonctions \`recurrence\`, \`repeatedEdges\` et \`minimumRepairs\` de \`src/model.ts\`, et du registre de sources autorisées \`publicWorks.register.authored\`. L'exploration contient **256** affectations binaires. Aucune ne respecte simultanément la récurrence et l'alternance stricte sur sept relais. Les **14** affectations récurrentes comportant exactement une répétition sont les réparations minimales, dont seulement **2** ont une réalisation littéraire rédigée. L'outil n'invente pas les textes des douze autres.

L'ancien sélecteur des 14 réparations reste disponible pour parcourir ce sous-ensemble. Lorsqu'un utilisateur modifie directement une position et quitte ce sous-ensemble, le sélecteur affiche son affectation actuelle sans la remplacer automatiquement. Un résultat non minimal reste affiché et peut être modifié librement. La comparaison littéraire reste réservée aux deux réalisations réellement écrites.

## Moteur de choix réutilisable

\`experience/src/choiceEngine.ts\` contient un moteur **pur et sans dépendance React** pour une séquence de positions fixes avec un ensemble fini de valeurs admises. Contrairement à \`orderEngine.ts\`, qui permute des identifiants uniques, les mêmes valeurs peuvent apparaître sur plusieurs positions. Réutiliser un moteur de permutation pour des affectations répétées introduirait une fausse analogie mathématique.

API :

- \`createChoiceState(options,initial,historyLimit?)\` : copie et fige les valeurs de départ ; historique borné par défaut à 32.
- \`setChoice(state,index,value)\` : affecte une position sans changer les autres.
- \`setChoices(state,values)\` : sélectionne explicitement une configuration complète.
- \`undoChoices\`, \`redoChoices\`, \`resetChoices\` : opérations réversibles, historique borné, branche de rétablissement effacée lors d'un nouvel acte.

Les valeurs inconnues, tailles incorrectes et indices invalides sont refusés. Les changements sans effet conservent l'identité de l'état. La bibliothèque ne crée aucun texte, droit, interprétation ou garantie pédagogique.

## Vérification

- Tests du noyau sur les **256** affectations : génération et choix de chaque position, immutabilité, erreurs, annulation, rétablissement et limite d'historique.
- Test de cohérence avec les **14** résultats de \`minimumRepairs\` et le registre des **2** réalisations.
- Scénarios navigateur : changements de jours, états invalides, messages de diagnostic, historique, catalogue canonique, originalité des textes, clavier, anglais et affichage à 320 pixels.
- Captures sur ordinateur, mobile et à 320 pixels ; tests d'accessibilité, contrôle de sources épinglées et de publication hors ligne inchangés.

La prochaine validation requiert des essais humains indépendants et des tests NVDA/VoiceOver. Le calcul fini n'établit ni chronologie littéraire ni supériorité pédagogique.

**Séparation de publication :** aucun manuscrit ni archive de *La Relève* n'est intégré à ce module. Le contenu public demeure contrôlé par \`contentCatalog.ts\` et \`LICENSE-CONTENT.md\`.
