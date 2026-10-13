# POELIO — Literary and editorial quality gate

**Status: internal desk critique, not independent editorial acceptance or a reader study.** This review is subordinate to the six-stage product specification in docs/PRODUCT_SPEC.md.

## Core finding

The software now demonstrates two distinct computational operations, yet the literary value of the authored public texts has not been independently established. Formal correctness must not become a proxy for artistic quality. The evaluation target is a compelling encounter with prose, an encounter with its formal construction, and a reader's ability to invent a different procedure.

### Le Registre des clefs — minimum repair

The finite model is valuable because the conflict between recurrence and alternation is exact, with fourteen labelled minimum repairs. Two of those configurations have actually authored passages. **Twelve do not:** the interface must never present them as missing automatically generated literary works.

The present prose is short and expository. It contains the possibility of an epistemic narrative, though its aesthetic effect is untested. The question "Qui sait quoi ?" risks priming one reading of character knowledge that the formal model does not prove. Facilitation must invite disagreement and other interpretations. A future literary editor should read both authored passages **before seeing the mathematics**, assess the prose independently, and recommend revisions through versioned source control.

### Les Quatre Témoins — order and interpretation

Four fixed, attributed passages admit exactly 24 reading orders; a declared precedence constraint admits 12. The revised opening no longer announces the mechanism in its title. The interface preserves the original words and explores their ordering.

Not all 24 sequences are necessarily coherent or aesthetically effective. Computing a permutation is not computing a literary interpretation. The comparison highlights movement, not semantic equivalence. A critical reader should examine a deliberately varied set of arrangements, including weaker or contradictory ones, and discuss why they produce different readings.

## Review and eventual release criteria

| Criterion | Evidence expected | Current status |
|---|---|---|
| First encounter is meaningful without disclosing the rule | Independent writer and literary-editor review | Pending |
| Exact formal properties of each model are correct | Exhaustive unit tests and documented scope | Tested |
| Shared source-module identity denotes identical prose | Strict content validation and negative regression tests | Implemented |
| Comparison leads to close reading of actual words | External close-reading sessions | Pending |
| An invention stage produces new authorial choices | Facilitated pilot with voluntary participant feedback | Pending |
| Historical context is sourced and distinct from institutional affiliation | Editorial source verification | Partially documented |
| Authorship and publication rights are respected | Channel-specific permissions review | Pending for unpublished work |
| Users can participate through accessible interfaces | Automated and human accessibility evaluation | Automated gate added; manual pending |

## Proposed evaluation (not yet conducted)

Invite an experimental writer, a literary-creation teacher, and a digital-literature scholar to review the two public examples independently. Ask for specific evidence about diction, tension, interpretation, and whether the constraint enriches or overwhelms the work. Avoid averaging subjective scores into a purported literary-quality number.

Then conduct a small observational workshop, with consent for any systematic data collection. Observe whether participants distinguish computable facts from interpretation, can invent a rule of their own, and find the literary encounter satisfying. Comparison against a well-edited static explanation is necessary for any causal learning claim.

## Change discipline

No private La Relève source may enter the public repository or pilot. Updates to already approved public *authored prose* require an editorial decision, a recorded provenance change, and an updated source pin. Explanatory and navigation text also needs review for interpretive bias.

**Release verdict:** two technically grounded literary demonstrations; independent editorial and empirical acceptance outstanding.
