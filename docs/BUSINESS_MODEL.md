# 💼 Modèle Économique - TrueScope by Joël

## 🎯 Vision

**TrueScope** est un outil de **génération de leads qualifiés** pour artisans (serrurerie, plomberie, électricité).

L'utilisateur obtient un **diagnostic gratuit** grâce à l'IA → En échange, Joël reçoit un **lead pré-qualifié** avec un client qui comprend déjà son problème.

---

## 📊 Business Model Canvas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRUESCOPE - BUSINESS MODEL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PARTENAIRES CLÉS        ACTIVITÉS CLÉS           PROPOSITION DE VALEUR     │
│  ─────────────────       ─────────────            ───────────────────────    │
│  • Google (Gemini AI)    • Développement IA       POUR L'UTILISATEUR:        │
│  • Firebase              • Marketing digital      • Diagnostic GRATUIT       │
│  • Artisans partenaires  • Acquisition users      • Comprend son problème    │
│                          • Support artisans       • Trouve un artisan        │
│                                                                              │
│  RESSOURCES CLÉS         RELATION CLIENT          POUR JOËL (ARTISAN):       │
│  ────────────────        ─────────────            • Leads qualifiés          │
│  • Algorithme IA         • Self-service           • Client pré-informé       │
│  • Base de données       • CTA vers artisan       • Gain de temps            │
│  • Marque TrueScope      • Support email          • Plus de conversions      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STRUCTURE DE COÛTS                    SOURCES DE REVENUS                    │
│  ──────────────────                    ──────────────────                    │
│  • API Gemini (~0.04€/analyse)         • Lead generation pour Joël           │
│  • Hébergement (~20€/mois)             • (Futur) Commission par lead         │
│  • Firebase (~25€/mois)                • (Futur) Abonnements artisans        │
│  • Domaine (~12€/an)                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Segments de Clients

### 1. Utilisateurs (B2C) - GRATUIT

| Profil | Besoin | Parcours |
|--------|--------|----------|
| Propriétaire bloqué dehors | Comprendre son problème de serrure | Diagnostic → Contact Joël |
| Locataire avec fuite | Savoir si c'est grave | Diagnostic → Contact Joël |
| Rénovateur bricoleur | Identifier la panne électrique | Diagnostic → Contact Joël |

**Caractéristiques :**
- Problème immédiat ou semi-urgent
- Pas expert dans le domaine
- Cherche une solution rapide
- Sensible au prix mais prêt à payer pour du sérieux

### 2. Artisans (B2B) - FUTUR

| Profil | Besoin | Valeur TrueScope |
|--------|--------|------------------|
| Joël (fondateur) | Développer sa clientèle | Leads gratuits via sa plateforme |
| Artisans partenaires | Trouver des clients | Leads qualifiés payants |
| Franchises | Digitaliser l'acquisition | Solution clé en main |

---

## 💰 Stratégie de Monétisation

### Phase 1 : MVP (Actuel)
**Modèle : Lead Generation pour Joël uniquement**

```
Coût TrueScope ≈ 50€/mois
                    │
                    ▼
            Diagnostics générés
                    │
                    ▼
            ~30% cliquent "Trouver un Joël"
                    │
                    ▼
            ~33% deviennent clients
                    │
                    ▼
            Panier moyen : 200€
```

**Calcul ROI :**
- 100 diagnostics/mois
- 30 clics CTA (30%)
- 10 interventions (33%)
- Chiffre d'affaires : 10 × 200€ = **2,000€**
- ROI : 2,000€ / 50€ = **40x**

### Phase 2 : Multi-Artisans (Futur)

| Modèle | Prix | Description |
|--------|------|-------------|
| **Commission/lead** | 15-25€ | Par demande de contact qualifiée |
| **Abonnement mensuel** | 49-149€ | Accès aux leads de sa zone |
| **Featured** | +50€/mois | Priorité dans les résultats |

### Phase 3 : Marketplace (Long terme)

- Plateforme type "Doctolib des artisans"
- Prise de rendez-vous en ligne
- Paiement sécurisé
- Avis clients vérifiés

---

## 📈 Métriques Clés (KPIs)

### Acquisition
| Métrique | Cible M1 | Cible M6 | Cible M12 |
|----------|----------|----------|-----------|
| Visiteurs uniques | 500 | 5,000 | 20,000 |
| Diagnostics créés | 100 | 1,000 | 5,000 |
| Taux de conversion diagnostic | 20% | 25% | 30% |

### Engagement
| Métrique | Cible |
|----------|-------|
| Taux clic CTA "Trouver un Joël" | >30% |
| Taux de rebond | <50% |
| Temps moyen sur diagnostic | >2 min |

### Conversion
| Métrique | Cible |
|----------|-------|
| Lead → Contact | >50% |
| Contact → Intervention | >30% |
| Intervention → Récurrence | >20% |

---

## 🎪 Funnel de Conversion

```
         ACQUISITION                    ACTIVATION                    RÉTENTION
    ─────────────────────          ─────────────────────          ─────────────
    
    ┌─────────────────────┐
    │    VISITEUR         │ ← SEO, Ads, Bouche-à-oreille
    │    (100%)           │
    └─────────┬───────────┘
              │ 20% créent un diagnostic
              ▼
    ┌─────────────────────┐
    │    DIAGNOSTIC       │ ← Formulaire simple, UX fluide
    │    (20%)            │
    └─────────┬───────────┘
              │ 70% voient le résultat
              ▼
    ┌─────────────────────┐
    │    RÉSULTAT IA      │ ← Diagnostic clair + CTA visible
    │    (14%)            │
    └─────────┬───────────┘
              │ 30% cliquent CTA
              ▼
    ┌─────────────────────┐
    │    LEAD             │ ← Formulaire contact simple
    │    (4.2%)           │
    └─────────┬───────────┘
              │ 33% deviennent clients
              ▼
    ┌─────────────────────┐
    │    CLIENT           │ ← Intervention réalisée
    │    (1.4%)           │
    └─────────────────────┘
```

---

## 💸 Analyse des Coûts

### Coûts Variables (par diagnostic)

| Ressource | Coût unitaire | Notes |
|-----------|---------------|-------|
| Gemini API | ~0.035€ | ~700 tokens in + 500 out |
| Firebase Reads | ~0.001€ | ~10 reads |
| Firebase Writes | ~0.002€ | ~3 writes |
| **Total/diagnostic** | **~0.04€** | |

### Coûts Fixes Mensuels

| Service | MVP | Scale (1k users) |
|---------|-----|------------------|
| Vercel | 0€ | 20€ |
| Railway | 5€ | 20€ |
| Firebase | 0-25€ | 50€ |
| Domaine | 1€ | 1€ |
| **Total** | **~30€** | **~90€** |

### Break-even

```
Coûts fixes : ~50€/mois
Valeur d'un lead converti : 200€ (panier moyen)
Marge sur intervention : ~60% = 120€

Break-even = 50€ / 120€ = 0.42 interventions/mois

→ Il suffit de 1 intervention par mois pour être rentable !
```

---

## 🏆 Avantages Concurrentiels

| Avantage | Description |
|----------|-------------|
| **IA Diagnostic** | Unique sur le marché des artisans |
| **Gratuit pour l'utilisateur** | Pas de barrière à l'entrée |
| **Lead pré-qualifié** | Client qui comprend son problème |
| **Marque "Joël"** | Confiance, proximité |
| **Base de données** | Apprentissage continu |

---

## 🚧 Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Diagnostic IA incorrect | Perte de confiance | Validation humaine, amélioration continue |
| Coût API Gemini explose | Marge réduite | Rate limiting, caching, pricing adapté |
| Peu de conversions | ROI faible | A/B testing CTAs, remarketing |
| Concurrence | Perte de parts | First-mover advantage, UX supérieure |

---

## 📅 Roadmap Business

### T1 2024 - MVP
- [x] Diagnostic IA fonctionnel
- [x] Interface utilisateur
- [ ] CTA "Trouver un Joël"
- [ ] Tracking des leads

### T2 2024 - Validation
- [ ] 100+ diagnostics/mois
- [ ] Mesure du taux de conversion
- [ ] Premiers retours utilisateurs

### T3 2024 - Croissance
- [ ] SEO / Content marketing
- [ ] Témoignages clients
- [ ] Amélioration IA

### T4 2024 - Monétisation
- [ ] Ouverture à d'autres artisans
- [ ] Système d'abonnement
- [ ] Dashboard artisan

---

## 📞 Informations de Contact Joël

*À configurer dans le système :*

```
Nom : Joël [NOM]
Téléphone : +33 6 XX XX XX XX
Email : contact@joel-artisan.fr
Zone : Île-de-France
Métiers : Serrurerie, Plomberie, Électricité
Horaires : 7j/7, 8h-20h
```
