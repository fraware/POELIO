# POELIO | Kit d'évaluation indépendante des parcours littéraires

**Statut au 13 octobre 2026 :** instruments préparés. Aucune séance, observation de lecteur, approbation éditoriale extérieure ni validation d'accessibilité humaine n'est déclarée accomplie par ce document.

**Périmètre :** uniquement les deux œuvres publiques autorisées, *Le Registre des clefs* et *Les Quatre Témoins*. Aucun manuscrit privé ni corpus d'étude séparé ne fait partie du dispositif.

## 1. Décision recherchée

Trois jugements distincts doivent rester séparés dans les comptes rendus.

1. **Lecture littéraire indépendante.** Avant toute explication du procédé, le texte suscite-t-il une attention, des hypothèses et une critique qui lui sont propres ? Un avis négatif, circonstancié, est un résultat utile.
2. **Parcours littéraire.** La succession Lire → Questionner → Explorer → Comparer → Inventer → Revenir aide-t-elle une personne à mettre en relation ses choix de lecture, les transformations contrôlées et son propre texte ? Où l'explication mathématique interrompt-elle la lecture ?
3. **Accessibilité et autonomie.** Une personne découvre-t-elle les six étapes, utilise-t-elle les interactions et conserve-t-elle volontairement son écriture, y compris au clavier et sur mobile ?

Aucune de ces trois questions n'est tranchée par l'exhaustivité des modèles, les tests Playwright, les appréciations du développeur ou un taux de clic. Une étude comparative d'efficacité pédagogique demanderait un protocole et une autorisation distincts.

## 2. Parcours et supports

Toutes les adresses suivantes sont **publiques** et contiennent exclusivement les textes de démonstration autorisés. Pour le site GitHub Pages, le préfixe est `https://fraware.github.io/POELIO/`. Sur un serveur local, employer le préfixe indiqué par Vite.

| Moment | Registre | Quatre Témoins |
|---|---|---|
| Lecture initiale sans révélation | `?review=register` | `?review=permutation` |
| Explication statique, **après** critique initiale | `?companion=register` | `?companion=permutation` |
| Parcours interactif, **après** critique initiale | `?work=register` | `?work=permutation` |
| Guide pour l'animateur | `facilitator.html` | même guide |

**Règle de contamination.** Le premier lecteur reçoit uniquement le lien `?review=...`, sans accueil du site, catalogue, comparateur, article technique, dossier éditorial ou indication de la contrainte. Un navigateur déjà utilisé pour POELIO risque de compromettre cette première exposition. Il s'agit d'une lecture *sans amorçage*, et non d'un aveuglement garanti : le code du site est public et le lecteur conserve sa liberté d'exploration.

La page de première lecture conserve ses réponses en mémoire de l'onglet ; actualiser ou fermer la page les perd. L'export TXT relève d'une action volontaire. Le parcours interactif emploie pour sa part un stockage de session avec export TXT et sauvegarde JSON explicite. Ne promettre ni collecte automatique ni reprise durable des notes.

## 3. Revue littéraire extérieure : trois avis indépendants visés

Demander, si possible, une lecture à une personne travaillant l'écriture expérimentale, une à une personne enseignant l'écriture, et une à une personne étudiant ou critiquant la littérature numérique. Ces profils sont des **cibles de recrutement**, pas des personnes déjà contactées. Chercher des lecteurs novices ou peu familiers du dispositif en complément ; trois expertises ne constituent ni une enquête représentative ni un résultat statistique.

### Message de première sollicitation — à transmettre seul

> Je prépare un atelier de lecture indépendant consacré à des textes brefs. J'aimerais recueillir votre réaction littéraire avant toute explication sur la manière dont ces textes ont été composés. La lecture et l'avis sont facultatifs ; aucune réponse n'est transmise par le site. Si vous acceptez, je vous adresserai un seul texte et quelques questions ouvertes. Je préciserai séparément les conditions de conservation ou de citation de tout retour que vous choisirez de partager.

Ne joindre **ni** le présent protocole **ni** une synthèse de la construction. La sollicitation ne prétend pas qu'un avis a déjà été donné, ni que le projet est affilié à une institution littéraire.

### Première lecture : texte avant méthode

1. Fournir **un seul** des deux liens `?review=...`. Équilibrer, dans la mesure du possible, l'œuvre présentée en premier. Relever les connaissances antérieures *avec accord*, sans leur donner une valeur d'exclusion automatique.
2. Demander une lecture libre, sans chronomètre intrusif. La page propose une première impression facultative, puis un volet de critique éditoriale. Ne pas commenter le procédé entre ces deux moments.
3. Poser oralement, si une discussion est convenue : « Qu'est-ce qui retient votre attention ? », « Qu'est-ce qui vous résiste ? », « Quel passage réviseriez-vous et pourquoi ? », « Auriez-vous envie de lire ce texte sans autre présentation ? ». Accepter les silences et les désaccords.
4. Si le lecteur partage ses notes, demander séparément la permission de les **conserver**, de les **citer anonymement** et de les **attribuer**. L'accord sur l'un ne présume pas les autres.

Le formulaire à remplir par l'évaluateur est décrit dans [les fiches de terrain](READER_FIELD_RECORDS.md). Ne jamais transcrire une parole en la présentant comme une citation exacte si seule une paraphrase existe.

### Révélation et comparaison

Une fois la critique initiale **terminée et consignée**, proposer le compagnon statique correspondant. La question d'ouverture est : « Votre lecture change-t-elle à présent ? Si oui, à quel endroit et pour quelle raison ? ». Montrer ensuite, si le lecteur le souhaite, l'expérience interactive.

Ne pas présenter le compagnon statique comme inférieur : il contient le même matériau littéraire autorisé et l'essentiel de l'explication formelle. Ne pas déduire une supériorité du dispositif interactif d'une préférence exprimée à chaud.

L'évaluateur consigne indépendamment : le passage critiqué, le changement déclaré par le lecteur, un fait formel vérifiable, l'interprétation proposée et son degré d'incertitude.

## 4. Observation de première utilisation : douze à quinze nouveaux lecteurs envisagés

**Statut : projet de validation, pas recrutement accompli.** Étudier un premier groupe exploratoire de nouveaux lecteurs, séparé de la revue d'experts. Une séance individuelle courte est préférable pour identifier les interruptions de lecture avant une séance collective.

### Consignes à l'animateur

Lire au participant uniquement ce qui est nécessaire au moment où il en est. Éviter « test de créativité », « problème mathématique », « bonne réponse » et toute explication anticipée. Ne pas guider vers une interprétation privilégiée.

| Moment | Consigne au lecteur | À observer sans orienter |
|---|---|---|
| Première rencontre | « Lisez ce texte comme vous liriez une courte fiction. » | Repères, hésitations, intérêt et difficultés spontanées |
| Première interprétation | « Si vous le souhaitez, notez ce qui vous intrigue. » | Expression personnelle ou décision légitime de ne rien écrire |
| Exploration | « Modifiez quelque chose et racontez ce qui a changé. » | Reconnaissance de la règle, découverte des contrôles, erreurs |
| Comparaison | « Relisez ces passages. Quelles différences comptez-vous ? » | Distinction entre prose écrite, ordre déplacé et faits calculés |
| Invention | « Proposez une règle qui vous appartient et écrivez à partir d'elle. » | Auteur véritable de la règle, liberté de la détourner |
| Retour | « Relisez votre première impression si vous en avez une. Qu'en pensez-vous à présent ? » | Continuité de lecture, divergences, utilisation de l'export |

Ne pas assister immédiatement une personne bloquée ; décrire l'obstacle et offrir une aide respectueuse et consentie. Ne pas transformer un silence ou un abandon en échec littéraire. Vérifier expressément que les douze arrangements du Registre **sans prose rédigée** ne sont jamais présentés comme douze textes supplémentaires. Pour *Les Quatre Témoins*, comparer des fragments strictement identiques dans un autre ordre.

### Fin de séance

Poser trois questions ouvertes : « À quel moment avez-vous cessé de penser au texte ? », « Quel passage ou quelle opération souhaiteriez-vous reprendre ? », « Qu'auriez-vous voulu faire et que l'interface ne permettait pas ? ». Donner au lecteur le choix d'exporter ses écrits, de les conserver chez lui ou de les effacer. Le site ne centralise aucune réponse.

Une évaluation avec répartition aléatoire, groupe témoin, mesures de compréhension ou conclusions sur l'apprentissage constitue un **autre projet** : se reporter à [la comparaison statique](STATIC_COMPARISON_PROTOCOL.md) et vérifier au préalable les obligations de consentement et d'examen institutionnel applicables.

## 5. Accessibilité et droit au retrait

Une séance à distance ou sur dispositif personnel peut exposer des besoins d'accessibilité différents d'une démonstration sur le matériel du concepteur. Utiliser [le guide de vérification manuelle](ACCESSIBILITY_FIELD_RUNBOOK.md) pour le clavier, les lecteurs d'écran, le zoom et l'export. Les observations sur un besoin d'adaptation ne constituent pas des informations de profil à publier.

Avant **toute** collecte, déterminer le responsable de la conservation, sa finalité, les personnes autorisées à consulter les notes, le lieu de stockage, une durée de conservation et la procédure de retrait. Sans ces décisions et l'accord approprié, conserver uniquement des notes techniques impersonnelles sur le fonctionnement de l'interface, sans propos individuels. Les textes du lecteur ne rejoignent jamais le dépôt, un ticket GitHub, un service de suivi automatique ou une archive CI.

Le besoin éventuel d'une évaluation éthique ou institutionnelle dépend de l'usage envisagé et doit être apprécié **avant** le début d'une étude systématique. Le présent document ne délivre aucune autorisation.

## 6. Critère de décision éditoriale

Documenter les réactions divergentes et les contre-exemples, puis choisir l'une des actions suivantes pour chaque œuvre : **pilote envisageable**, **révision nécessaire avant pilote**, **reconception majeure** ou **informations insuffisantes**.

Une décision positive demande des passages précis qui fonctionnent sans mathématiques, une discussion explicite de ce qui échoue, la distinction établie entre calcul et interprétation, des interactions utilisables, ainsi qu'une revue des droits. Aucune moyenne chiffrée ne remplace ce jugement.

**Ne pas déclarer la revue réalisée** tant que les fiches de terrain ne contiennent pas de retours réels, autorisés et vérifiables. Les tests automatisés et la présente préparation constituent des preuves de fonctionnement et d'organisation, jamais des témoignages humains.
