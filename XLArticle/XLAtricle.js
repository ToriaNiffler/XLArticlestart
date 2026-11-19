const storySequence = document.querySelector(".storySequence");
const storySlides = storySequence?.querySelectorAll(".storySlide");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (storySequence && storySlides?.length && !reduceMotion) {
    storySequence.classList.add("isScrollAnimated");

    const updateStory = () => {
        const sequenceTop = storySequence.getBoundingClientRect().top + window.scrollY;
        const scrollRange = Math.max(storySequence.offsetHeight - window.innerHeight, 1);
        const scrollProgress = Math.min(Math.max((window.scrollY - sequenceTop) / scrollRange, 0), 1);
        const transitionProgress = Math.min(scrollProgress / 0.82, 1) * (storySlides.length - 1);
        const activeIndex = Math.floor(transitionProgress);
        const nextIndex = Math.min(activeIndex + 1, storySlides.length - 1);
        const slideProgress = transitionProgress - activeIndex;
        const fadeProgress = Math.min(Math.max((slideProgress - 0.55) / 0.4, 0), 1);
        const crossfadeProgress = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
        const sequenceFadeProgress = Math.min(Math.max((1 - scrollProgress) / 0.06, 0), 1);
        const sequenceOpacity = sequenceFadeProgress * sequenceFadeProgress * (3 - 2 * sequenceFadeProgress);

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

const videoSequence = document.querySelector(".videoSequence");
const videoStage = videoSequence?.querySelector(".storyVideo");
const storyVideo = videoStage?.querySelector("video");

if (storyVideo) {
    storyVideo.muted = true;
    storyVideo.volume = 0;
    storyVideo.addEventListener("volumechange", () => {
        if (!storyVideo.muted || storyVideo.volume > 0) {
            storyVideo.muted = true;
            storyVideo.volume = 0;
        }
    });
}

if (videoSequence && storyVideo && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                storyVideo.play().catch((error) => {
                    if (error.name !== "AbortError") {
                        console.error("The story video could not start automatically.", error);
                    }
                });
            } else {
                storyVideo.pause();
            }
        });
    }, { threshold: 0.1 });

    videoObserver.observe(videoStage);
}

if (videoSequence && videoStage && !reduceMotion) {
    const updateVideoFade = () => {
        const sequenceTop = videoSequence.getBoundingClientRect().top + window.scrollY;
        const scrollRange = Math.max(videoSequence.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max((window.scrollY - sequenceTop) / scrollRange, 0), 1);
        const fadeIn = Math.min(progress / 0.2, 1);
        const fadeOut = Math.min((1 - progress) / 0.2, 1);
        const fade = Math.min(fadeIn, fadeOut);

        videoStage.style.opacity = String(fade * fade * (3 - 2 * fade));
    };

    let updateScheduled = false;
    const scheduleVideoFade = () => {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;
        window.requestAnimationFrame(() => {
            updateVideoFade();
            updateScheduled = false;
        });
    };

    updateVideoFade();
    window.addEventListener("scroll", scheduleVideoFade, { passive: true });
    window.addEventListener("resize", scheduleVideoFade);
}