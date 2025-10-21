import { redirect } from "next/navigation";

export default function RedirectCategoriesToCatalog() {
  redirect("/catalog?view=categories");
}
