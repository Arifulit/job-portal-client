// এই ফাইলটি shared utility/helper বা low level integration function রাখে।
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}