import { defineStore } from "pinia";
import { ref } from "vue";
import { useDirectionStore } from "./direction";
import { useEnseignantStore } from "@/pinia/enseignant";
import { useScolariteStore } from "@/pinia/scolarite";
import { usePersonneStore } from "@/pinia/personne";

export const useRegexStore = defineStore("regex", () => {
  const valide = ref(true);
  const direction = useDirectionStore();
  const enseignant = useEnseignantStore();
  const scolarite = useScolariteStore();
  const personne = usePersonneStore();

  //Regex Email
  function validationEmail() {
    const emailValue =
      direction.email || enseignant.email || scolarite.email || personne.email;
    if (emailValue.trim() === "") {
      valide.value = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      valide.value = emailRegex.test(emailValue);
    }
  }

  return {
    validationEmail,
    valide,
  };
});
