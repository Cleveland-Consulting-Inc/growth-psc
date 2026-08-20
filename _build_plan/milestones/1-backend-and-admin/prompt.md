# Milestone 1 — Backend & Admin

You are entering plan mode to plan and then build milestone 1 of this project.

## Context

- Read `@_build_plan/prd.html` for the full project context, scope, data model, and tech stack.
- This is milestone 1. There are no prior milestones to read.

## Your task

1. Plan the implementation for **only** milestone 1 as defined in the PRD. Do not plan or build anything from milestone 2.
2. After the user confirms the plan, build only what is in milestone 1's scope.
3. Verify your work against the "Done when" criteria for milestone 1 in the PRD.
4. When complete, write a `milestone-log.md` in this folder (`_build_plan/milestones/1-backend-and-admin/milestone-log.md`). Structure it as follows:
   - **Start with a `## What's new in the app` section at the very top.** A concise, human-readable, bulleted list of the main user-facing features added in this milestone — written so a non-technical reviewer can see at a glance what new things to expect. Frame each bullet as a capability the user will now see or be able to do.
   - Then include implementation detail sections for the next milestone's agent:
     - What was built (files created, models added, routes added, etc.)
     - Any decisions made during implementation not pre-specified in the PRD
     - Anything milestone 2 will need to know
     - Any deviations from the PRD and why

## Additional context for the agent

- The reference HTML pitch deck is at `Original_html/Wilson_Tennis_Camps_2027.html`. Study its structure, sections, and editable content areas — the proposal page template in milestone 2 will be based on this design. The editable content fields you define in the data model (the `content` blob on Proposal and Template) should map to the text elements in that HTML.
- Match the Nuxt 3 + Tailwind v4 setup from the PSC Website Rebuild project at `/Users/court/superconductor/projects/PSC Website Rebuild` — specifically `package.json`, `nuxt.config.ts`, and `src/assets/css/main.css` (or equivalent).
- The app runs in SSR mode (not static generation) to support server routes, middleware, and database access.
- Deployment target is Vercel. The subdomain `growth.premiersportscamps.com` will point to the Vercel deployment via DNS — do not attempt to configure DNS in code.

Ask me any clarifying questions to lock in the implementation plan for this milestone.
