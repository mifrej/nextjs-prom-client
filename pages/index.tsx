import Link from "next/link";
import { useRouter } from "next/router";
export default () => {
  const router = useRouter();

  console.log(router);

  if (typeof window === "undefined") {
    return (
      <div>
        Hello World.{" "}
        <Link href="/about">
          <a>About!!</a>
        </Link>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />
  );
};
