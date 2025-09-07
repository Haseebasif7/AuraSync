# AuraSync

AuraSync is a hackathon MVP that reimagines how marketers, designers, and product teams create product visuals. Instead of costly photoshoots or heavy editing, AuraSync makes it possible to generate photorealistic lifestyle scenes and seamlessly place products into them with a single prompt.

---

## ✨ Core Value Proposition
- Generate a **photorealistic scene** in seconds  
- Place any **product into the scene** with seamless integration  
- **Refine instantly** with prompt-only tweaks (lighting, scale, position, style)  
- Track **history with undo/redo** and versioning for fast iteration  

---

## 🎯 Target Users
- **Marketers & Brand Designers** → Campaign mockups, OOH ads, e-commerce hero shots  
- **Product Teams** → Rapid concept testing and moodboards  
- **Agencies & Freelancers** → Quick comps for proposals  

---

## 🛠️ MVP Scope
- **Scene Handling**: Upload or generate scenes via text prompts  
- **Product Handling**: Upload or generate product images  
- **Composition**: Merge products into scenes through multimodal prompts  
- **Refinement Loop**: Prompt-only edits on the composite image  
- **History**: Save, undo, redo, and reset project states  
- **UX**: Minimal interface with single prompt box, progress feedback, and error handling  

---

## 📐 Primary User Journeys
### 1. Create First Composite
- Upload or generate a scene (16:9)  
- Upload or generate a product (1:1)  
- Write a prompt describing placement and look  
- Generate one composite image  

### 2. Refine
- Lock inputs after first composite  
- Adjust results with lighting, scale, position, or style tweaks via prompts  
- Save versions and use undo/redo  

### 3. Start Over
- Reset to a new project  
- Prior states remain in history until reset  

---

## ✅ Acceptance Criteria
- User can generate a scene from a prompt  
- User can generate a product from a prompt  
- With scene + product + placement prompt, a composite image is created  
- After composite, scene/product inputs are locked; refinements adjust output  
- Undo/redo accurately moves between outputs and prompts  
- Errors surface clear, readable messages without crashes  

---
