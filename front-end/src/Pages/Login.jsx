import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../Url/api.js";
import { saveAuth } from "../utils/auth.js";

// One page handles both signing in and creating an account. It talks to the
// real backend (/auth/login, /auth/register), stores the returned JWT, and then
// sends the user on to wherever they were headed (or the language picker).
export const Login = () => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after auth: the page the guard bounced us from, else /language.
  const redirectTo = location.state?.from || "/language";

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      return toast({
        title: "Email and password are required.",
        position: "top",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    if (isSignup && password.length < 6) {
      return toast({
        title: "Password must be at least 6 characters.",
        position: "top",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const payload = isSignup
        ? { email, password, name: name || undefined }
        : { email, password };

      const { data } = await api.post(endpoint, payload);
      saveAuth(data.token, data.user);

      toast({
        title: isSignup ? "Account created!" : "Welcome back!",
        description: "Redirecting you to the interview panel.",
        position: "top",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        "Something went wrong. Please try again.";
      toast({
        title: msg,
        position: "top",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={{ base: "12", md: "20" }} px={{ base: "4", sm: "8" }}>
      <Stack spacing="8">
        <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
          <Heading size={{ base: "sm", md: "md" }}>
            {isSignup ? "Create your account" : "Log in to your account"}
          </Heading>
          <Text color="gray.500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => setMode(isSignup ? "login" : "signup")}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Button>
          </Text>
        </Stack>

        <Box
          as="form"
          onSubmit={handleSubmit}
          py={{ base: "6", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          bg="white"
          boxShadow="md"
          borderRadius="xl"
        >
          <Stack spacing="6">
            <Stack spacing="5">
              {isSignup && (
                <FormControl>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    placeholder="Your name (optional)"
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="At least 6 characters"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Stack>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText={isSignup ? "Creating account..." : "Signing in..."}
            >
              {isSignup ? "Sign up" : "Sign in"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};
