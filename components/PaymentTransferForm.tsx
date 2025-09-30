"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { getBank, getBankByAccountId } from "@/lib/actions/user.actions";
import { decryptId, validateDwollaConfig, validateFundingSourceUrl } from "@/lib/utils";

import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Transfer note is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Please enter a valid amount greater than $0.00"),
  senderBank: z.string().min(1, "Please select a bank account"),
  sharableId: z.string().min(8, "Please enter a valid sharable ID"),
});

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      senderBank: "",
      sharableId: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log("=== TRANSFER SUBMISSION STARTED ===");
    console.log("Form data:", { ...data, amount: data.amount });

    try {
      // Step 1: Decrypt and validate sharable ID
      console.log("Step 1: Decrypting sharable ID...");
      console.log("Original sharable ID from form:", data.sharableId);
      let receiverAccountId;
      try {
        receiverAccountId = decryptId(data.sharableId);
        console.log("Decrypted receiver account ID:", receiverAccountId);
        
        if (!receiverAccountId) {
          throw new Error("Decryption returned null or empty value");
        }
      } catch (decryptError) {
        console.error("Failed to decrypt sharable ID:", decryptError);
        alert("Invalid recipient account ID. Please check the sharable ID and try again.");
        setIsLoading(false);
        return;
      }

      // Step 2: Get receiver bank information
      console.log("Step 2: Getting receiver bank information...");
      const receiverBank = await getBankByAccountId({
        accountId: receiverAccountId,
      });
      
      if (!receiverBank) {
        console.error("Receiver bank not found for account ID:", receiverAccountId);
        alert("Recipient account not found. Please verify the sharable ID is correct.");
        setIsLoading(false);
        return;
      }
      console.log("Receiver bank found:", {
        id: receiverBank.$id,
        accountId: receiverBank.accountId,
        fundingSourceUrl: receiverBank.fundingSourceUrl ? "Present" : "Missing",
        userId: receiverBank.userId
      });

      // Step 3: Get sender bank information
      console.log("Step 3: Getting sender bank information...");
      const senderBank = await getBank({ documentId: data.senderBank });
      
      if (!senderBank) {
        console.error("Sender bank not found for document ID:", data.senderBank);
        alert("Source bank account not found. Please try reconnecting your bank.");
        setIsLoading(false);
        return;
      }
      console.log("Sender bank found:", {
        id: senderBank.$id,
        accountId: senderBank.accountId,
        fundingSourceUrl: senderBank.fundingSourceUrl ? "Present" : "Missing",
        userId: senderBank.userId
      });

      // Step 4: Validate Dwolla configuration
      console.log("Step 4: Validating Dwolla configuration...");
      const dwollaConfig = validateDwollaConfig();
      if (!dwollaConfig.isValid) {
        console.error("Dwolla configuration invalid:", dwollaConfig.missingVars);
        alert("Payment system is not properly configured. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Step 5: Validate funding source URLs
      console.log("Step 5: Validating funding source URLs...");
      if (!validateFundingSourceUrl(senderBank.fundingSourceUrl)) {
        console.error("Invalid sender funding source URL:", senderBank.fundingSourceUrl);
        console.log("Attempting to create funding source automatically...");
        
        // Try to create funding source automatically
        try {
          const fixResponse = await fetch('/api/create-funding-source', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bankId: senderBank.$id }),
          });

          if (!fixResponse.ok) {
            throw new Error(`HTTP error! status: ${fixResponse.status}`);
          }

          const fixData = await fixResponse.json();
          
          if (fixData.success) {
            console.log("Funding source created successfully:", fixData.fundingSourceUrl);
            // Update the senderBank object with the new funding source URL
            senderBank.fundingSourceUrl = fixData.fundingSourceUrl;
            console.log("Continuing with transfer using newly created funding source...");
          } else {
            console.error("Failed to create funding source:", fixData.error);
            alert(`Your source bank is not fully set up for transfers. Error: ${fixData.error || 'Unknown error'}. Please reconnect this bank using the 'Connect Bank' button in the sidebar or My Banks section.`);
            setIsLoading(false);
            return;
          }
        } catch (fixError: any) {
          console.error("Error creating funding source:", fixError);
          alert(`Your source bank is not fully set up for transfers. Network error: ${fixError.message || 'Unknown error'}. Please reconnect this bank using the 'Connect Bank' button in the sidebar or My Banks section.`);
          setIsLoading(false);
          return;
        }
      }

      if (!validateFundingSourceUrl(receiverBank.fundingSourceUrl)) {
        console.error("Invalid receiver funding source URL:", receiverBank.fundingSourceUrl);
        console.log("Attempting to create funding source for receiver automatically...");
        
        // Try to create funding source for receiver automatically
        try {
          const fixResponse = await fetch('/api/create-funding-source', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bankId: receiverBank.$id }),
          });

          if (!fixResponse.ok) {
            throw new Error(`HTTP error! status: ${fixResponse.status}`);
          }

          const fixData = await fixResponse.json();
          
          if (fixData.success) {
            console.log("Receiver funding source created successfully:", fixData.fundingSourceUrl);
            // Update the receiverBank object with the new funding source URL
            receiverBank.fundingSourceUrl = fixData.fundingSourceUrl;
            console.log("Continuing with transfer using newly created receiver funding source...");
          } else {
            console.error("Failed to create receiver funding source:", fixData.error);
            alert(`The recipient's bank is not fully set up for transfers. Error: ${fixData.error || 'Unknown error'}. Please ask the recipient to reconnect their bank using the 'Connect Bank' button in their My Banks section.`);
            setIsLoading(false);
            return;
          }
        } catch (fixError: any) {
          console.error("Error creating receiver funding source:", fixError);
          alert(`The recipient's bank is not fully set up for transfers. Network error: ${fixError.message || 'Unknown error'}. Please ask the recipient to reconnect their bank using the 'Connect Bank' button in their My Banks section.`);
          setIsLoading(false);
          return;
        }
      }

      // Step 6: Validate amount
      console.log("Step 6: Validating transfer amount...");
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount:", data.amount);
        alert("Please enter a valid transfer amount greater than $0.00.");
        setIsLoading(false);
        return;
      }

      if (amount < 0.01) {
        console.error("Amount too small:", amount);
        alert("Transfer amount must be at least $0.01.");
        setIsLoading(false);
        return;
      }

      // Step 7: Check if sender and receiver are the same
      if (senderBank.$id === receiverBank.$id) {
        console.error("Cannot transfer to same account");
        alert("Cannot transfer funds to the same account. Please select a different recipient.");
        setIsLoading(false);
        return;
      }

      // Step 8: Prepare transfer parameters
      console.log("Step 8: Preparing transfer parameters...");
      
      // Final validation of funding source URLs
      if (!senderBank.fundingSourceUrl || !receiverBank.fundingSourceUrl) {
        console.error("Missing funding source URLs after validation");
        alert("Bank setup incomplete. Please reconnect your bank accounts and try again.");
        setIsLoading(false);
        return;
      }

      const transferParams = {
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: amount.toFixed(2), // Ensure string format like "5.00"
      };
      console.log("Transfer parameters:", {
        ...transferParams,
        sourceFundingSourceUrl: transferParams.sourceFundingSourceUrl.substring(0, 50) + "...",
        destinationFundingSourceUrl: transferParams.destinationFundingSourceUrl.substring(0, 50) + "..."
      });

      // Step 9: Create transfer via Dwolla
      console.log("Step 9: Creating transfer via Dwolla...");
      const transfer = await createTransfer(transferParams);
      
      if (!transfer) {
        console.error("Transfer creation failed - no transfer URL returned");
        alert("Transfer failed. Please check your bank setup and try again.");
        setIsLoading(false);
        return;
      }
      console.log("Transfer created successfully:", transfer);

      // Step 10: Create transaction record
      console.log("Step 10: Creating transaction record...");
      
      // Validate user IDs before creating transaction
      if (!senderBank.userId || !receiverBank.userId) {
        console.error("Missing user IDs in bank data");
        alert("Invalid bank account data. Please reconnect your bank accounts.");
        setIsLoading(false);
        return;
      }

      const transaction = {
        name: data.name || `Transfer to ${data.email}`,
        amount: amount.toFixed(2),
        senderId: senderBank.userId.$id || senderBank.userId,
        senderBankId: senderBank.$id,
        receiverId: receiverBank.userId.$id || receiverBank.userId,
        receiverBankId: receiverBank.$id,
        email: data.email,
      };
      console.log("Transaction data:", transaction);

      const newTransaction = await createTransaction(transaction);

      if (!newTransaction) {
        console.error("Transaction record creation failed");
        alert("Transfer was successful but transaction record could not be created. Please check your transaction history.");
      } else {
        console.log("Transaction record created successfully:", newTransaction.$id);
      }

      // Step 11: Success - show success message and redirect
      console.log("=== TRANSFER COMPLETED SUCCESSFULLY ===");
      alert(`Transfer of $${amount.toFixed(2)} to ${data.email} completed successfully!`);
      form.reset();
      router.push("/");
      
    } catch (error: any) {
      console.error("=== TRANSFER FAILED ===");
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        body: error?.body,
        stack: error?.stack
      });

      // Provide more specific error messages based on error type
      let errorMessage = "Transfer failed. Please try again.";
      
      if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your account. Please check your balance and try again.";
      } else if (error?.message?.includes("invalid account")) {
        errorMessage = "Invalid account information. Please verify the recipient's details and try again.";
      } else if (error?.message?.includes("network") || error?.message?.includes("timeout")) {
        errorMessage = "Network error occurred. Please check your internet connection and try again.";
      } else if (error?.body?.message) {
        errorMessage = `Transfer failed: ${error.body.message}`;
      } else if (error?.message) {
        errorMessage = `Transfer failed: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("=== TRANSFER SUBMISSION ENDED ===");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        <FormField
          control={form.control}
          name="senderBank"
          render={() => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Select Source Bank
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Select the bank account you want to transfer funds from
                  </FormDescription>
                </div>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <BankDropdown
                      accounts={accounts}
                      setValue={form.setValue}
                      otherStyles="!w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <div className="payment-transfer_form-content">
                  <FormLabel className="text-14 font-medium text-gray-700">
                    Transfer Note (Optional)
                  </FormLabel>
                  <FormDescription className="text-12 font-normal text-gray-600">
                    Please provide any additional information or instructions
                    related to the transfer
                  </FormDescription>
                </div>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Textarea
                      placeholder="Write a short note here"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="payment-transfer_form-details">
          <h2 className="text-18 font-semibold text-gray-900">
            Bank account details
          </h2>
          <p className="text-16 font-normal text-gray-600">
            Enter the bank account details of the recipient
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Recipient&apos;s Email Address
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="ex: johndoe@gmail.com"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sharableId"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-5 pt-6">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Receiver&apos;s Plaid Sharable Id
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="Enter the public account number"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="border-y border-gray-200">
              <div className="payment-transfer_form-item py-5">
                <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                  Amount
                </FormLabel>
                <div className="flex w-full flex-col">
                  <FormControl>
                    <Input
                      placeholder="ex: 5.00"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-12 text-red-500" />
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className="payment-transfer_btn-box">
          <Button type="submit" className="payment-transfer_btn">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Transfer Funds"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentTransferForm;
