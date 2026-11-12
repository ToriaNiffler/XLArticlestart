const storySequence = document.querySelector(".storySequence");
const storySlides = storySequence?.querySelectorAll(".storySlide");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (storySequence && storySlides?.length && !reduceMotion) {
    storySequence.classList.add("isScrollAnimated");

    const updateStory = () => {
        const sequenceTop = storySequence.getBoundingClientRect().top + window.scrollY;
        const scrollRange = Math.max(storySequence.offsetHeight - window.innerHeight, 1);
        const scrollProgress = Math.min(Math.max((window.scrollY - sequenceTop) / scrollRange, 0), 1);
        const transitionProgress = Math.min(scrollProgress / 0.86, 1) * (storySlides.length - 1);
        const activeIndex = Math.floor(transitionProgress);
        const nextIndex = Math.min(activeIndex + 1, storySlides.length - 1);
        const crossfadeProgress = transitionProgress - activeIndex;
        const sequenceOpacity = Math.min((1 - scrollProgress) / 0.14, 1);

        storySlides.forEach((slide, index) => {
            let opacity = 0;

            if (index === activeIndex) {
                opacity = 1 - crossfadeProgress;
            } else if (index === nextIndex && nextIndex !== activeIndex) {
                opacity = crossfadeProgress;
            }

            slide.style.opacity = String(opacity * sequenceOpacity);
            slide.classList.toggle("isCurrent", index === activeIndex && sequenceOpacity > 0);
            slide.setAttribute("aria-hidden", String(index !== activeIndex || sequenceOpacity === 0));
            slide.inert = index !== activeIndex || sequenceOpacity === 0;
        });
    };

    let updateScheduled = false;
    const scheduleStoryUpdate = () => {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;
        window.requestAnimationFrame(() => {
            updateStory();
            updateScheduled = false;
        });
    };

    updateStory();
    window.addEventListener("scroll", scheduleStoryUpdate, { passive: true });
    window.addEventListener("resize", scheduleStoryUpdate);
}