import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const Dashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <main className="max-w-6xl p-8 mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard POS</h2>
            <p className="text-sm text-muted-foreground">
              Welcome to Dashboard
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6 shadow-lg border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Today Sales
                </CardTitle>
                {/* icon */}
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
            <Card className="p-6 shadow-lg border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Today Sales
                </CardTitle>
                {/* icon */}
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
            <Card className="p-6 shadow-lg border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Today Sales
                </CardTitle>
                {/* icon */}
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
      {/* <Container>
        <h3 className="mb-4">Ringkasan</h3>
        <Row className="g-4">
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <Card.Subtitle className="mb-2 text-muted">All Sales</Card.Subtitle>
              <Card.Title className="fs-3 fw-bold text-success">Rp. 50.000.000</Card.Title>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <Card.Subtitle className="mb-2 text-muted">All Sales</Card.Subtitle>
              <Card.Title className="fs-3 fw-bold text-success">Rp. 50.000.000</Card.Title>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <Card.Subtitle className="mb-2 text-muted">All Sales</Card.Subtitle>
              <Card.Title className="fs-3 fw-bold text-success">Rp. 50.000.000</Card.Title>
            </Card>
          </Col>
        </Row>
      </Container> */}
    </>
  );
};

export default Dashboard;
