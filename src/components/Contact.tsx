import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute("data-idx");
            if (idx) {
              setRevealedItems((prev) => {
                const next = new Set(prev);
                next.add(idx);
                return next;
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = sectionRef.current?.querySelectorAll(".reveal-item");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("Contact form submitted:", data);
    setIsSubmitted(true);
    reset();
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-[14vh] px-[6vw] border-t border-white/15 relative z-10 bg-black/60 backdrop-blur-md"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
        <div
          className={`flex flex-col items-start transition-all duration-1000 transform ${
            revealedItems.has("info")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="info"
        >
          <div className="eyebrow mb-6 flex items-center gap-2.5 text-[0.75rem] tracking-[0.28em] uppercase text-emerald-400 font-mono font-bold">
            Establish Uplink
          </div>
          <h2 className="font-sans text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] text-white mb-6 tracking-tight">
            Let's build<br />something <span className="text-emerald-400 italic font-serif">extraordinary.</span>
          </h2>
          <p className="text-[1.05rem] text-gray-200 leading-relaxed font-normal mb-8 max-w-md">
            Direct channel for product leadership inquiries, enterprise RTM consultations, and high-impact software projects.
          </p>
          <a
            href="mailto:hello@utkarsh.ind.in"
            className="font-mono text-[clamp(1.4rem,3.5vw,2.5rem)] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-10 block cursor-none"
            data-cursor
          >
            hello@utkarsh.ind.in
          </a>
          <div className="flex gap-8 font-mono text-[0.85rem] font-bold">
            <a
              href="https://linkedin.com/in/utkarshkr13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-none"
              data-cursor
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/utkarshkr13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-emerald-400 transition-colors uppercase tracking-wider cursor-none"
              data-cursor
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div
          className={`bg-white/5 border border-white/20 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl transition-all duration-1000 transform ${
            revealedItems.has("form")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          } reveal-item`}
          data-idx="form"
        >
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4 font-sans">
              <span className="inline-block text-5xl text-emerald-400 animate-bounce">✓</span>
              <h3 className="text-2xl font-bold text-white">Uplink Confirmed!</h3>
              <p className="text-sm text-gray-200 max-w-sm mx-auto leading-relaxed font-medium">
                Thank you for reaching out. Transmission received — I'll get back to you within 24 hours.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="mt-6 rounded-full px-6 py-2.5 text-xs tracking-wider uppercase font-bold bg-emerald-400 text-black hover:bg-emerald-300 transition-all cursor-none"
                data-cursor
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-xs uppercase tracking-widest text-gray-300 font-bold">Name</label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  {...register("name")}
                  placeholder="Your name"
                  aria-invalid={errors.name ? "true" : "false"}
                  className="rounded-xl border-white/20 bg-white/5 px-4 py-6 text-sm text-white placeholder:text-gray-400 cursor-none"
                  data-cursor
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-xs uppercase tracking-widest text-gray-300 font-bold">Email</label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="Your email address"
                  aria-invalid={errors.email ? "true" : "false"}
                  className="rounded-xl border-white/20 bg-white/5 px-4 py-6 text-sm text-white placeholder:text-gray-400 cursor-none"
                  data-cursor
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-xs uppercase tracking-widest text-gray-300 font-bold">Subject</label>
                <Input
                  id="contact-subject"
                  {...register("subject")}
                  placeholder="What is this inquiry about?"
                  aria-invalid={errors.subject ? "true" : "false"}
                  className="rounded-xl border-white/20 bg-white/5 px-4 py-6 text-sm text-white placeholder:text-gray-400 cursor-none"
                  data-cursor
                />
                {errors.subject && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-xs uppercase tracking-widest text-gray-300 font-bold">Message</label>
                <Textarea
                  id="contact-message"
                  {...register("message")}
                  placeholder="Tell me about your project, team, or opportunity..."
                  aria-invalid={errors.message ? "true" : "false"}
                  className="rounded-xl border-white/20 bg-white/5 px-4 py-3 min-h-[120px] text-sm text-white placeholder:text-gray-400 cursor-none"
                  data-cursor
                />
                {errors.message && (
                  <p className="text-xs text-red-400 mt-1 font-mono">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full py-6 text-[0.82rem] tracking-widest uppercase font-medium bg-accent text-[#04150a] border border-accent hover:bg-fg hover:text-black hover:border-fg transition-all duration-300 disabled:opacity-50 cursor-none"
                data-cursor
              >
                {isSubmitting ? "Sending Inquiry..." : "Submit Inquiry"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
