import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 auto-rows-[12rem] md:auto-rows-[15rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  header,
}: {
  className?: string;
  header?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col overflow-hidden rounded-xl border border-none bg-white transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none min-h-[12rem] md:min-h-[15rem]",
        className,
      )}
    >
      <div className="flex items-center justify-center w-full h-full">
        {header}
      </div>
    </div>
  );
};
