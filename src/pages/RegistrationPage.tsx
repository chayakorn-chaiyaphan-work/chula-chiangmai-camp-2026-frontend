import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ApiError } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { RegistrationInput } from "../api/types";
import { useSession } from "../auth/SessionProvider";
import { Button, InlineAlert, PageIntro } from "../components/ui";

const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(255),
  lastName: z.string().trim().min(1, "Last name is required").max(255),
  nickname: z.string().trim().min(1, "Nickname is required").max(255),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
  faculty: z.string().trim().min(1, "Faculty is required").max(255),
  academicYear: z.coerce.number().int().min(1).max(10),
  dietaryRequirements: z.string().trim().max(1000),
  medicalNotes: z.string().trim().max(2000),
  emergencyContactName: z.string().trim().min(1, "Emergency contact is required").max(255),
  emergencyContactPhone: z.string().trim().min(8, "Enter a valid phone number").max(20),
});

export function RegistrationPage() {
  const { profile, refreshProfile } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "", lastName: "", nickname: "", phone: "", faculty: "", academicYear: 1,
      dietaryRequirements: "", medicalNotes: "", emergencyContactName: "", emergencyContactPhone: "",
    },
  });

  useEffect(() => {
    if (!profile?.participant) return;
    const { firstName, lastName, nickname, phone, faculty, academicYear, dietaryRequirements, medicalNotes, emergencyContactName, emergencyContactPhone } = profile.participant;
    reset({ firstName, lastName, nickname, phone, faculty, academicYear, dietaryRequirements, medicalNotes, emergencyContactName, emergencyContactPhone });
  }, [profile?.participant, reset]);

  const mutation = useMutation({
    mutationFn: endpoints.register,
    onSuccess: async () => {
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/home", { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.details) {
        Object.entries(error.details).forEach(([field, message]) => setError(field as keyof RegistrationInput, { message }));
      }
    },
  });

  const fieldError = (name: keyof RegistrationInput) => errors[name]?.message && <span className="field__error">{errors[name]?.message}</span>;

  return (
    <div>
      <PageIntro
        eyebrow={profile?.participant ? "Participant profile" : "One last step"}
        title={profile?.participant ? "Registration details" : "Complete your registration"}
        description="These details help the camp team look after you safely. You can update them before camp begins."
      />
      {mutation.isSuccess && <InlineAlert tone="success"><CheckCircle2 size={17} /> Registration saved.</InlineAlert>}
      {mutation.error && !(mutation.error instanceof ApiError && mutation.error.details) && <InlineAlert tone="danger">{mutation.error.message}</InlineAlert>}

      <form className="registration-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <section className="panel">
          <h2>Personal information</h2>
          <p className="muted small">Use the same information you normally use for university records.</p>
          <div className="form-grid form-grid--two">
            <div className="field"><label htmlFor="firstName">First name</label><input id="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} {...register("firstName")} />{fieldError("firstName")}</div>
            <div className="field"><label htmlFor="lastName">Last name</label><input id="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} {...register("lastName")} />{fieldError("lastName")}</div>
            <div className="field"><label htmlFor="nickname">Nickname</label><input id="nickname" aria-invalid={!!errors.nickname} {...register("nickname")} />{fieldError("nickname")}</div>
            <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />{fieldError("phone")}</div>
            <div className="field"><label htmlFor="faculty">Faculty</label><input id="faculty" aria-invalid={!!errors.faculty} {...register("faculty")} />{fieldError("faculty")}</div>
            <div className="field"><label htmlFor="academicYear">Academic year</label><select id="academicYear" {...register("academicYear", { valueAsNumber: true })}>{Array.from({ length: 10 }, (_, index) => <option value={index + 1} key={index + 1}>Year {index + 1}</option>)}</select>{fieldError("academicYear")}</div>
          </div>
        </section>

        <section className="panel">
          <h2>Health and dietary notes</h2>
          <p className="muted small">Only share information the camp team needs to support you.</p>
          <div className="form-grid">
            <div className="field"><label htmlFor="dietaryRequirements">Dietary requirements</label><textarea id="dietaryRequirements" placeholder="Allergies, vegetarian meals, or leave blank" aria-invalid={!!errors.dietaryRequirements} {...register("dietaryRequirements")} />{fieldError("dietaryRequirements")}</div>
            <div className="field"><label htmlFor="medicalNotes">Medical notes</label><textarea id="medicalNotes" placeholder="Conditions, medication, or leave blank" aria-invalid={!!errors.medicalNotes} {...register("medicalNotes")} />{fieldError("medicalNotes")}</div>
          </div>
        </section>

        <section className="panel">
          <h2>Emergency contact</h2>
          <div className="form-grid form-grid--two">
            <div className="field"><label htmlFor="emergencyContactName">Contact name</label><input id="emergencyContactName" aria-invalid={!!errors.emergencyContactName} {...register("emergencyContactName")} />{fieldError("emergencyContactName")}</div>
            <div className="field"><label htmlFor="emergencyContactPhone">Contact phone</label><input id="emergencyContactPhone" type="tel" inputMode="tel" aria-invalid={!!errors.emergencyContactPhone} {...register("emergencyContactPhone")} />{fieldError("emergencyContactPhone")}</div>
          </div>
        </section>

        <div className="form-actions"><Button type="submit" icon={<Save size={18} />} loading={mutation.isPending} disabled={!isDirty && !!profile?.participant}>{profile?.participant ? "Save changes" : "Complete registration"}</Button></div>
      </form>
    </div>
  );
}
