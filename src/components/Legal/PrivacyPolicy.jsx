import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 py-24 px-6 sm:px-12 lg:px-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-sm"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gold hover:text-white transition-colors mb-8 text-sm uppercase tracking-widest font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-4xl sm:text-5xl font-serif text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-silver/50 mb-12">Last Updated: June 25, 2026</p>

        <div className="space-y-10 text-base leading-relaxed text-silver/80">
          <section>
            <h2 className="text-2xl font-serif text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Yogi Studio. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our application 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">2. The Data We Collect</h2>
            <p className="mb-3">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2 text-silver/70">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this application.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our application, products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">3. How We Use Your Data</h2>
            <p className="mb-3">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 text-silver/70">
              <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
              <li>To manage Your Account: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</li>
              <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
              <li>To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">4. Authentication and Third-Party Services</h2>
            <p>
              Our application uses Firebase Authentication to securely verify your identity via SMS OTP (One-Time Password). 
              By using our service, you acknowledge that your phone number will be securely processed by Google Firebase to provide 
              authentication services. We do not use your phone number for marketing purposes without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">5. Face Data & Biometric Information</h2>
            <p className="mb-3">Our application utilizes facial recognition technology (AI Selfie Search) to help you quickly find your photos from a specific event. We are committed to ensuring the absolute privacy and security of your biometric data. Here is exactly how your Face Data is handled:</p>
            <ul className="list-disc pl-6 space-y-2 text-silver/70">
              <li><strong>What face data is collected:</strong> When you use the "AI Search" feature, we capture a temporary live selfie from your device's camera. We process this image to generate a mathematical representation of your facial features (a facial vector or descriptor).</li>
              <li><strong>Use of face data:</strong> The generated facial vector is used strictly for the sole purpose of comparing it against the pre-indexed facial vectors of the photographs within the specific event you are attending. This allows the app to instantly filter and display only the photos in which you appear.</li>
              <li><strong>Storage and Retention:</strong> Your live selfie and the resulting facial vector are processed <strong>locally and temporarily</strong> in your device's active memory. They are <strong>never</strong> transmitted to, uploaded to, or stored on our servers or databases. The face data is instantly and permanently deleted from memory the moment the search is complete or the application is closed. We do not retain any face data.</li>
              <li><strong>Sharing of face data:</strong> Your face data (selfie and facial vectors) is <strong>never</strong> shared with, sold to, or disclosed to any third parties, advertising networks, or external services under any circumstances.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">6. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">7. Your Legal Rights</h2>
            <p className="mb-3">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-silver/70">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br /><br />
              <strong>Yogi Studio</strong><br />
              Email: snapyogibalu@gmail.com
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
