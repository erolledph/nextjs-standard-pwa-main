# 🎯 SEO ACTION CHECKLIST - QUICK REFERENCE

**Overall Score:** 8.7/10 (EXCELLENT)  
**Status:** Ready for optimization with significant growth potential  
**Time to Implement:** 15-20 hours over 90 days

---

## 🔴 CRITICAL (Do First - Week 1)

### [ ] 1. Implement Recipe Schema JSON-LD
- [ ] Locate: `components/pages/recipes/RecipePost.tsx`
- [ ] Add JSON-LD script with `recipeSchema()` function
- [ ] Map recipe fields: name, description, image, prepTime, cookTime, servings, ingredients, instructions
- [ ] Test with Google Rich Results tool (https://search.google.com/test/rich-results)
- [ ] Verify no validation errors
- **Impact:** +20-30% CTR on recipe search results
- **Effort:** 30 minutes
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 2. Fix Twitter Creator Handle
- [ ] Search for: `@yourhandle` across all files
- [ ] Replace with: `@worldfoodrecipes`
- [ ] Update in: `app/recipes/[slug]/page.tsx` + `app/blog/[slug]/page.tsx`
- [ ] Test Twitter Card: https://cards-dev.twitter.com/validator
- **Impact:** +2-3% Twitter CTR
- **Effort:** 5 minutes
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 3. Test All Schema Markup
- [ ] Use: Google Rich Results Tester
- [ ] Test 5 recipe pages
- [ ] Test 5 blog posts
- [ ] Fix validation errors
- [ ] Document results
- **Impact:** Identify issues before they cost rankings
- **Effort:** 30 minutes
- **Owner:** [__________]
- **Due:** [__________]

---

## 🟠 HIGH PRIORITY (Week 1-2)

### [ ] 4. Improve Image Alt Text
- [ ] Current: `alt={title} - Recipe | World Food Recipes`
- [ ] Update to: `alt={title} - Easy ${difficulty} recipe with ${prepTime} prep time`
- [ ] Files: `RecipePostCard.tsx`, `BlogPostCard.tsx`
- [ ] Add image dimensions: `width` and `height` attributes
- **Impact:** +5% Core Web Vitals, better SEO
- **Effort:** 1 hour
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 5. Add Breadcrumb Navigation
- [ ] Create: `components/common/Breadcrumb.tsx`
- [ ] Add to: Recipe pages, Blog pages
- [ ] Include breadcrumbSchema JSON-LD
- [ ] Style consistently with design system
- **Impact:** +3-5% CTR, better crawlability
- **Effort:** 2 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 6. Create Author Pages
- [ ] Create: `app/authors/[author]/page.tsx`
- [ ] Create: `app/authors/[author]/layout.tsx`
- [ ] Add author metadata & schema
- [ ] Link from recipe/blog pages to author pages
- [ ] Add author bio component
- **Impact:** +10-20% E-E-A-T signals
- **Effort:** 3-4 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 7. Update Author Credibility
- [ ] Add author credentials to metadata
- [ ] Create author bio database
- [ ] Add "About Author" component to posts
- [ ] Include author photo
- [ ] Add expertise summary
- **Impact:** Increased trust signals
- **Effort:** 2 hours
- **Owner:** [__________]
- **Due:** [__________]

---

## 🟡 MEDIUM PRIORITY (Week 2-3)

### [ ] 8. Heading Hierarchy Audit
- [ ] Review all recipe pages for H1 placement
- [ ] Ensure only ONE H1 per page
- [ ] Check H2/H3 hierarchy
- [ ] Optimize heading keyword inclusion
- [ ] Create style guide for headings
- **Impact:** +5-10% on-page SEO
- **Effort:** 4-6 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 9. Content Expansion Strategy
- [ ] Identify 10 top recipes to expand
- [ ] Target: 2000+ words per recipe
- [ ] Add: Tips, variations, nutrition, storage info
- [ ] Include FAQ section in each recipe
- [ ] Add internal links (3-5 per 1000 words)
- **Impact:** +30-50% organic traffic potential
- **Effort:** 20 hours (ongoing)
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 10. Build Topical Clusters
- [ ] Identify main topics (Italian, Asian, Desserts, etc.)
- [ ] Create pillar pages
- [ ] Map related recipes to clusters
- [ ] Add internal linking strategy
- [ ] Cross-link cluster pages
- **Impact:** +30-50% topical authority
- **Effort:** 10 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 11. Optimize Images
- [ ] Convert to WEBP format
- [ ] Set proper dimensions (thumbnail, card, full)
- [ ] Add width/height attributes to images
- [ ] Consider Next.js Image component
- [ ] Optimize file sizes (<200KB for full-width)
- **Impact:** +5% page speed, +2% rankings
- **Effort:** 4-6 hours
- **Owner:** [__________]
- **Due:** [__________]

---

## 🟢 LOWER PRIORITY (Week 3+)

### [ ] 12. Add Comment System
- [ ] Research comment solutions (Disqus, Commento, custom)
- [ ] Implement moderation workflow
- [ ] Add author reply functionality
- [ ] Style comments to match design
- [ ] Test spam protection
- **Impact:** +15-25% engagement signals
- **Effort:** 8 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 13. Add Rating System
- [ ] Create 5-star recipe rating component
- [ ] Store ratings in database
- [ ] Display aggregate ratings in schema
- [ ] Show recent reviews
- [ ] Add rating-based sorting
- **Impact:** +20-30% CTR with rich snippets
- **Effort:** 6 hours
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 14. Link Building Campaign
- [ ] Identify 50+ target food blogs
- [ ] Create outreach email templates
- [ ] Begin guest post pitches (2-3 per week)
- [ ] Find broken link opportunities
- [ ] Monitor backlink growth
- **Impact:** +50-100% search visibility
- **Effort:** 8-10 hours/week (ongoing)
- **Owner:** [__________]
- **Due:** [__________]

---

### [ ] 15. Set Up Analytics Dashboard
- [ ] Connect Google Search Console
- [ ] Set up Google Analytics 4
- [ ] Create monthly tracking spreadsheet
- [ ] Define KPI targets
- [ ] Set up automated reporting
- **Impact:** Data-driven decisions
- **Effort:** 3 hours
- **Owner:** [__________]
- **Due:** [__________]

---

## 📅 MONTH-BY-MONTH IMPLEMENTATION TIMELINE

### MONTH 1: Foundation & Critical Fixes
```
Week 1: Critical Fixes (Recipe Schema, Twitter, Testing)
Week 2: Author Pages, Image Alt Text, Breadcrumbs
Week 3: Credibility Signals, Heading Audit
Week 4: Setup Analytics, Document Baseline
```

### MONTH 2: Content & Authority
```
Week 5: Begin Content Expansion (5 recipes)
Week 6: Continue Expansion, Build Clusters
Week 7: Link Building Campaign Launch
Week 8: Monitor Rankings, Review Progress
```

### MONTH 3: Advanced Optimization
```
Week 9: Comments/Ratings Implementation
Week 10: Advanced SEO (internal linking strategy)
Week 11: Seasonal Content Planning
Week 12: Quarterly Review, Set Next Quarter Goals
```

---

## 📊 SUCCESS METRICS

### Track Monthly (Google Search Console)
- [ ] Organic Impressions
- [ ] Organic Clicks
- [ ] Click-Through Rate (CTR)
- [ ] Average Position
- [ ] Impressions for target keywords

### Track Weekly (Analytics)
- [ ] Organic Sessions
- [ ] Pages per Session
- [ ] Avg. Session Duration
- [ ] Bounce Rate
- [ ] Conversions

### Track Quarterly (Authority)
- [ ] Domain Authority (Ahrefs/Moz)
- [ ] New Referring Domains
- [ ] Backlink Growth
- [ ] Keyword Rankings (top 10)

---

## ✅ COMPLETION CHECKLIST

**WEEK 1 GOALS:**
- [ ] Recipe Schema implemented
- [ ] Twitter handle fixed
- [ ] Schema validation passed
- [ ] Author pages created

**MONTH 1 GOALS:**
- [ ] All images optimized
- [ ] Breadcrumb navigation added
- [ ] Author credibility section added
- [ ] Heading hierarchy reviewed
- [ ] Analytics dashboard set up
- [ ] Baseline metrics documented

**MONTH 2 GOALS:**
- [ ] 5+ recipes expanded to 2000+ words
- [ ] Topical clusters mapped
- [ ] Internal linking strategy implemented
- [ ] 10+ guest post pitches sent
- [ ] 2-3 backlinks acquired

**MONTH 3 GOALS:**
- [ ] Comments system live
- [ ] Rating system live
- [ ] 15+ recipes expanded
- [ ] 30+ link building outreach sent
- [ ] 5-10 backlinks acquired
- [ ] +20-30% organic traffic growth

---

## 🎓 LEARNING RESOURCES

### SEO Fundamentals
- [ ] Google Search Central: https://developers.google.com/search
- [ ] Google's SEO Starter Guide: https://developers.google.com/search/docs/beginner/seo-starter-guide
- [ ] Moz SEO Learning Center: https://moz.com/learn/seo

### Tools to Use
- [ ] Google Search Console: https://search.google.com/search-console
- [ ] Google Analytics 4: https://analytics.google.com
- [ ] Google PageSpeed Insights: https://pagespeed.web.dev
- [ ] Google Rich Results Tester: https://search.google.com/test/rich-results
- [ ] Ahrefs Free Tools: https://ahrefs.com/seo-tools
- [ ] Screaming Frog SEO Spider: https://www.screamingfrog.co.uk/seo-spider/

### Advanced Topics
- [ ] E-E-A-T and YMYL: https://developers.google.com/search/docs/beginner/experience
- [ ] Core Web Vitals: https://web.dev/vitals/
- [ ] Schema.org Markup: https://schema.org/

---

## 📝 NOTES SECTION

### High-Performing Keywords to Target
```
1. "world food recipes" (current ranking)
2. "easy international recipes"
3. "authentic world food"
4. "food blog" (broader term)
5. "cooking tutorials"
```

### Content Ideas
```
1. "50 Essential International Recipes"
2. "Complete Guide to [Cuisine] Cooking"
3. "Easy Weeknight World Food Meals"
4. "Food Culture & Cooking Techniques"
5. "Common Cooking Mistakes & How to Fix Them"
```

### Link Building Opportunities
```
1. Food blogger partnerships
2. Recipe roundup posts
3. Cooking magazine features
4. Food influencer mentions
5. Cooking course integrations
```

---

**Document Status:** Created December 13, 2025  
**Last Updated:** [__________]  
**Next Review Date:** [__________]  

**Team Accountability:**  
- SEO Lead: ________________
- Content Lead: ________________
- Technical Lead: ________________
- Analytics Lead: ________________

---

## 🚀 LET'S GROW YOUR ORGANIC TRAFFIC!

Remember: SEO is a marathon, not a sprint. Consistent implementation of these actions over 90 days will yield 20-30% organic growth potential. Focus on quality over quick wins.

**Your target: Top 3 for primary keywords within 6 months.**
