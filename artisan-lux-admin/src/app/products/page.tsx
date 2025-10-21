import { redirect } from "next/navigation";

export default function RedirectProductsToCatalog() {
  redirect("/catalog?view=products");
}
