
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
}

export const PageTransition = ({ children, direction = "right" }: PageTransitionProps) => {
  const variants = {
    enter: {
      x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
      y: direction === "up" ? -300 : direction === "down" ? 300 : 0,
      opacity: 0
    },
    center: {
      x: 0,
      y: 0,
      opacity: 1
    },
    exit: {
      x: direction === "left" ? 300 : direction === "right" ? -300 : 0,
      y: direction === "up" ? 300 : direction === "down" ? -300 : 0,
      opacity: 0
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

interface ModalTransitionProps {
  isOpen: boolean;
  children: ReactNode;
}

export const ModalTransition = ({ isOpen, children }: ModalTransitionProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface TabTransitionProps {
  activeTab: string;
  children: ReactNode;
  tabKey: string;
}

export const TabTransition = ({ activeTab, children, tabKey }: TabTransitionProps) => (
  <AnimatePresence mode="wait">
    {activeTab === tabKey && (
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const StaggeredList = ({ children }: { children: ReactNode[] }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
  >
    {children.map((child, index) => (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

export const FadeInUp = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay
    }}
  >
    {children}
  </motion.div>
);
