"use client"

import { DollarSign, PieChart, BarChart3, CreditCard } from "lucide-react"
import { motion } from "framer-motion"

export function FallbackScene() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
      <div className="relative w-full h-full">
        {/* Background elements */}
        <div className="absolute w-full h-full bg-gradient-to-b from-primary/5 to-primary/10 opacity-50"></div>
        
        {/* Animated icons */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex gap-8 mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DollarSign className="h-16 w-16 text-primary animate-bounce" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PieChart className="h-16 w-16 text-primary animate-pulse" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <BarChart3 className="h-16 w-16 text-primary animate-bounce" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <CreditCard className="h-16 w-16 text-primary animate-pulse" />
            </motion.div>
          </div>
          
          <motion.p 
            className="text-lg text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Using simplified visualization mode
          </motion.p>
        </div>
      </div>
    </div>
  )
}

