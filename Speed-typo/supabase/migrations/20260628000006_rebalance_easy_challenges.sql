-- ============================================================================
-- Rééquilibrage du tier Facile : certaines quêtes étaient trop triviales.
-- N'affecte que la génération des MOIS SUIVANTS (le mois courant est déjà tiré).
-- Les titres traduits (i18n) ont reçu les nouveaux slugs correspondants.
-- ============================================================================

update public.st_challenge_templates
  set goal_value = 3, description = 'Termine 3 parties'
  where title = 'Échauffement' and goal_type = 'games';

update public.st_challenge_templates
  set goal_value = 35, description = 'Atteins 35 WPM dans une partie'
  where title = 'Petit doigté' and goal_type = 'wpm';

update public.st_challenge_templates
  set goal_value = 25, description = 'Tape 25 mots dans une partie'
  where title = 'Bavard' and goal_type = 'words';

update public.st_challenge_templates
  set goal_value = 1200, description = 'Marque 1200 points en Classique'
  where title = 'Premiers pas' and goal_type = 'score';
