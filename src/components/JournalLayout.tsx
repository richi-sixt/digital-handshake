// Compatibility shim: entries in the private journal/ submodule still import
// `JournalLayout`. Remove once the posts live in the database (Phase 4).
export { BlogLayout as JournalLayout } from '@/components/BlogLayout'
