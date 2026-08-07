import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import DeepCourseGlossary from '@/components/deep/DeepCourseGlossary';
import DeepCourseModules from '@/components/deep/DeepCourseModules';
import DeepCourseQuiz from '@/components/deep/DeepCourseQuiz';
import type { DeepCourse, DeepCourseWrapper } from '@/lib/deep-course-types';
import { DEEP_COURSES } from '@/lib/deep-courses';

const PRICE_LABEL = '₱199/mo';

/** Rebuild the layout elements the interactive section originally sat inside. */
function withWrappers(wrappers: DeepCourseWrapper[] | undefined, children: ReactNode): ReactNode {
  if (!wrappers?.length) return children;
  return wrappers.reduceRight<ReactNode>((acc, w) => {
    const Tag = w.tag;
    return <Tag className={w.class}>{acc}</Tag>;
  }, children);
}

export default function DeepCourseView({ course, paid }: { course: DeepCourse; paid: boolean }) {
  const locked = course.premium && !paid;
  const premiumTrackCount = DEEP_COURSES.filter((c) => c.premium).length;

  return (
    <div className="min-h-screen">
      <Nav />

      <main>
        {course.chunks.map((chunk, i) => {
          if (chunk.kind === 'html') {
            if (!chunk.value) return null;
            return (
              // Verbatim authored course prose, generated at build time. Not user input.
              <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: chunk.value }} />
            );
          }

          if (chunk.value === 'MODULES') {
            return (
              <div key="modules">
                {withWrappers(
                  chunk.wrappers,
                  <DeepCourseModules
                    slug={course.slug}
                    modules={course.modules}
                    locked={locked}
                    previewCount={course.previewCount}
                    paid={paid}
                    priceLabel={PRICE_LABEL}
                    premiumTrackCount={premiumTrackCount}
                  />,
                )}
              </div>
            );
          }

          if (chunk.value === 'QUIZ') {
            return (
              <div key="quiz">
                {withWrappers(chunk.wrappers, <DeepCourseQuiz slug={course.slug} questions={course.quiz} />)}
              </div>
            );
          }

          if (chunk.value === 'GLOSSARY') {
            return (
              <div key="glossary">{withWrappers(chunk.wrappers, <DeepCourseGlossary entries={course.glossary} />)}</div>
            );
          }

          return null;
        })}
      </main>

      <Footer />
    </div>
  );
}
